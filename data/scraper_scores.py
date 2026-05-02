#!/usr/bin/env python3
"""
高考志愿填报数据爬虫 - 历年录取分数线
数据来源: 阳光高考、掌上高考、高考帮
"""

import requests
import json
import time
import re

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
}

PROVINCES = [
    '北京', '天津', '上海', '重庆',
    '河北', '山西', '辽宁', '吉林', '黑龙江',
    '江苏', '浙江', '安徽', '福建', '江西', '山东',
    '河南', '湖北', '湖南', '广东', '海南',
    '四川', '贵州', '云南', '陕西', '甘肃', '青海',
    '内蒙古', '广西', '西藏', '宁夏', '新疆',
]

YEARS = [2024, 2023, 2022, 2021, 2020]

def fetch_gaokao_scores_by_school(school_id, school_name):
    """从掌上高考获取指定学校历年分数线"""
    scores = []
    
    url = f"https://www.gaokao.cn/school/{school_id}/score"
    
    try:
        resp = requests.get(url, headers={**HEADERS, 'Referer': 'https://www.gaokao.cn/'}, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            items = data.get('data', {}).get('item', [])
            for item in items:
                scores.append({
                    'school_id': school_id,
                    'school_name': school_name,
                    'year': item.get('year'),
                    'province': item.get('province'),
                    'batch': item.get('batch'),
                    'min_score': item.get('min'),
                    'max_score': item.get('max'),
                    'avg_score': item.get('avg'),
                    'min_rank': item.get('min_rank'),
                    'subjects': item.get('local_type_name', ''),
                })
    except Exception as e:
        pass
    
    return scores


def fetch_chsi_score_lines():
    """从阳光高考爬取各省控制线"""
    score_lines = []
    
    for year in YEARS:
        for province in PROVINCES:
            try:
                url = "https://gaokao.chsi.com.cn/lqfs/prov/index.action"
                params = {
                    'prov': province,
                    'year': year,
                }
                resp = requests.get(url, params=params, headers=HEADERS, timeout=10)
                resp.encoding = 'utf-8'
                
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(resp.text, 'lxml')
                
                tables = soup.select('.score-table, .table')
                for table in tables:
                    rows = table.find_all('tr')
                    for row in rows[1:]:
                        cells = row.find_all('td')
                        if len(cells) >= 3:
                            score_lines.append({
                                'province': province,
                                'year': year,
                                'batch': cells[0].get_text(strip=True) if cells[0] else '',
                                'subjects': cells[1].get_text(strip=True) if len(cells) > 1 else '',
                                'score': cells[2].get_text(strip=True) if len(cells) > 2 else '',
                            })
                
                time.sleep(0.3)
            except Exception as e:
                continue
    
    return score_lines


def fetch_province_control_scores():
    """爬取各省历年分数控制线（一本线、二本线等）"""
    control_scores = []
    
    # 尝试从多个API获取
    # 1. 掌上高考API
    for year in YEARS:
        try:
            url = "https://www.gaokao.cn/score/control"
            params = {'year': year}
            resp = requests.get(url, params=params, headers={
                **HEADERS, 'Referer': 'https://www.gaokao.cn/'
            }, timeout=10)
            
            if resp.status_code == 200:
                data = resp.json()
                items = data.get('data', {}).get('item', [])
                for item in items:
                    control_scores.append({
                        'year': year,
                        'province': item.get('province', ''),
                        'batch': item.get('batch', ''),
                        'subjects': item.get('local_type_name', ''),
                        'score': item.get('control_score', ''),
                        'source': 'gaokao_cn',
                    })
                print(f"  掌上高考 {year}年控制线: {len(items)}条")
            time.sleep(0.5)
        except Exception as e:
            print(f"  掌上高考 {year}年失败: {e}")
    
    # 2. 高考帮 
    for year in YEARS:
        try:
            url = f"https://www.gaokao.com/e/api/score/control?year={year}"
            resp = requests.get(url, headers=HEADERS, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                items = data.get('data', [])
                for item in items:
                    control_scores.append({
                        'year': year,
                        'province': item.get('provname', ''),
                        'batch': item.get('batch', ''),
                        'subjects': item.get('kstype', ''),
                        'score': item.get('score', ''),
                        'source': 'gaokao_com',
                    })
                print(f"  高考帮 {year}年控制线: {len(items)}条")
            time.sleep(0.5)
        except Exception as e:
            print(f"  高考帮 {year}年失败: {e}")
    
    return control_scores


def fetch_school_score_lines_batch(schools, limit=200):
    """批量获取院校分数线"""
    all_scores = []
    count = 0
    
    for school in schools[:limit]:
        school_id = school.get('id', '')
        school_name = school.get('name', '')
        if not school_id:
            continue
        
        scores = fetch_gaokao_scores_by_school(school_id, school_name)
        all_scores.extend(scores)
        count += 1
        
        if count % 20 == 0:
            print(f"  已处理 {count} 所院校，共 {len(all_scores)} 条分数线数据")
            time.sleep(1)
        else:
            time.sleep(0.2)
    
    return all_scores


if __name__ == '__main__':
    print("=== 开始爬取分数线数据 ===")
    
    # 1. 控制线
    print("\n[1/2] 各省控制线...")
    control = fetch_province_control_scores()
    print(f"  共获取 {len(control)} 条控制线")
    
    with open('/home/runner/workspace/data/raw/control_scores_raw.json', 'w', encoding='utf-8') as f:
        json.dump(control, f, ensure_ascii=False, indent=2)
    
    # 2. 院校分数线 (读取已有学校列表)
    print("\n[2/2] 院校历年分数线...")
    try:
        with open('/home/runner/workspace/data/raw/universities_raw.json', encoding='utf-8') as f:
            schools = json.load(f)
        
        school_scores = fetch_school_score_lines_batch(schools, limit=300)
        print(f"  共获取 {len(school_scores)} 条院校分数线")
        
        with open('/home/runner/workspace/data/raw/school_scores_raw.json', 'w', encoding='utf-8') as f:
            json.dump(school_scores, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"  院校分数线爬取失败: {e}")
    
    print("\n✅ 分数线数据爬取完成")
