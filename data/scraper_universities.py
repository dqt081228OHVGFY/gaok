#!/usr/bin/env python3
"""
高考志愿填报数据爬虫 - 全国高校信息
数据来源: 教育部官网、阳光高考平台
"""

import requests
import json
import time
import re
from bs4 import BeautifulSoup

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Referer': 'https://gaokao.chsi.com.cn/',
}

def fetch_chsi_universities():
    """从阳光高考平台爬取高校列表"""
    universities = []
    
    # 阳光高考平台高校搜索API
    base_url = "https://gaokao.chsi.com.cn/sch/search.do"
    
    page = 1
    while True:
        try:
            params = {
                'start': (page - 1) * 20,
                'maxCount': 20,
                'searchAll': 'on',
                'sort': 'zscode',
            }
            resp = requests.get(base_url, params=params, headers=HEADERS, timeout=15)
            resp.encoding = 'utf-8'
            soup = BeautifulSoup(resp.text, 'lxml')
            
            items = soup.select('.search-list .list-item')
            if not items:
                break
                
            for item in items:
                try:
                    name_el = item.select_one('.school-name')
                    name = name_el.get_text(strip=True) if name_el else ''
                    
                    tags = [t.get_text(strip=True) for t in item.select('.tag-item')]
                    
                    province_el = item.select_one('.school-loc')
                    province = province_el.get_text(strip=True) if province_el else ''
                    
                    link = item.select_one('a')
                    href = link.get('href', '') if link else ''
                    school_id = re.search(r'schoolId=(\d+)', href)
                    school_id = school_id.group(1) if school_id else ''
                    
                    universities.append({
                        'id': school_id,
                        'name': name,
                        'province': province,
                        'tags': tags,
                        'source': 'chsi',
                    })
                except Exception as e:
                    continue
            
            print(f"  阳光高考 第{page}页: 获取{len(items)}所高校")
            if len(items) < 20:
                break
            page += 1
            time.sleep(0.5)
        except Exception as e:
            print(f"  阳光高考 第{page}页 失败: {e}")
            break
    
    return universities


def fetch_gaokao_universities():
    """从掌上高考爬取高校列表"""
    universities = []
    
    url = "https://www.gaokao.cn/school/search"
    
    for page in range(1, 100):
        try:
            params = {
                'page': page,
                'size': 20,
            }
            resp = requests.get(url, params=params, headers={
                **HEADERS,
                'Referer': 'https://www.gaokao.cn/',
            }, timeout=15)
            
            if resp.status_code != 200:
                break
                
            data = resp.json()
            items = data.get('data', {}).get('item', [])
            
            if not items:
                break
            
            for item in items:
                universities.append({
                    'id': str(item.get('schoolId', '')),
                    'name': item.get('name', ''),
                    'province': item.get('province', ''),
                    'city': item.get('city', ''),
                    'type': item.get('type', ''),
                    'level': item.get('level', ''),
                    'logo': item.get('logo', ''),
                    'tags': item.get('tags', []),
                    'source': 'gaokao_cn',
                })
            
            print(f"  掌上高考 第{page}页: 获取{len(items)}所高校")
            if len(items) < 20:
                break
            time.sleep(0.3)
        except Exception as e:
            print(f"  掌上高考 第{page}页 失败: {e}")
            break
    
    return universities


def fetch_moe_universities():
    """从教育部官网爬取高校名单"""
    universities = []
    
    # 教育部高校查询接口
    url = "http://www.moe.gov.cn/jyb_xxgk/s5743/s5744/A03/202210/t20221025_676135.html"
    
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.encoding = 'utf-8'
        soup = BeautifulSoup(resp.text, 'lxml')
        
        # 解析表格数据
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows[1:]:  # 跳过表头
                cells = row.find_all('td')
                if len(cells) >= 3:
                    universities.append({
                        'seq': cells[0].get_text(strip=True) if len(cells) > 0 else '',
                        'name': cells[1].get_text(strip=True) if len(cells) > 1 else '',
                        'competent_dept': cells[2].get_text(strip=True) if len(cells) > 2 else '',
                        'province': cells[3].get_text(strip=True) if len(cells) > 3 else '',
                        'type': cells[4].get_text(strip=True) if len(cells) > 4 else '',
                        'source': 'moe',
                    })
        
        print(f"  教育部 获取{len(universities)}所高校")
    except Exception as e:
        print(f"  教育部 失败: {e}")
    
    return universities


def fetch_unified_university_list():
    """综合多源爬取，构建统一高校数据集"""
    print("\n=== 开始爬取高校基础信息 ===")
    
    all_universities = {}
    
    # 1. 教育部官网
    print("\n[1/3] 教育部官网...")
    moe_unis = fetch_moe_universities()
    for u in moe_unis:
        name = u['name']
        if name and name not in all_universities:
            all_universities[name] = u
    print(f"    累计: {len(all_universities)} 所")
    
    # 2. 掌上高考
    print("\n[2/3] 掌上高考...")
    gaokao_unis = fetch_gaokao_universities()
    for u in gaokao_unis:
        name = u['name']
        if name:
            if name in all_universities:
                all_universities[name].update(u)
            else:
                all_universities[name] = u
    print(f"    累计: {len(all_universities)} 所")
    
    # 3. 阳光高考
    print("\n[3/3] 阳光高考...")
    chsi_unis = fetch_chsi_universities()
    for u in chsi_unis:
        name = u['name']
        if name:
            if name in all_universities:
                all_universities[name].update(u)
            else:
                all_universities[name] = u
    print(f"    累计: {len(all_universities)} 所")
    
    result = list(all_universities.values())
    
    # 保存原始数据
    with open('/home/runner/workspace/data/raw/universities_raw.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 高校数据爬取完成，共 {len(result)} 所")
    return result


if __name__ == '__main__':
    fetch_unified_university_list()
