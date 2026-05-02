#!/usr/bin/env python3
"""
高考志愿填报数据爬虫 - 专业信息
数据来源: 教育部专业目录、掌上高考
"""

import requests
import json
import time
from bs4 import BeautifulSoup

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
}

# 教育部本科专业目录 2024版
MOE_MAJORS_CATEGORIES = [
    {'code': '01', 'name': '哲学'},
    {'code': '02', 'name': '经济学'},
    {'code': '03', 'name': '法学'},
    {'code': '04', 'name': '教育学'},
    {'code': '05', 'name': '文学'},
    {'code': '06', 'name': '历史学'},
    {'code': '07', 'name': '理学'},
    {'code': '08', 'name': '工学'},
    {'code': '09', 'name': '农学'},
    {'code': '10', 'name': '医学'},
    {'code': '11', 'name': '军事学'},
    {'code': '12', 'name': '管理学'},
    {'code': '13', 'name': '艺术学'},
    {'code': '14', 'name': '交叉学科'},
]

# 完整专业列表（基于教育部2024年本科专业目录）
MAJORS_DATA = [
    # 哲学
    {'code': '010101', 'name': '哲学', 'category': '哲学', 'degree': '哲学学士', 'years': 4},
    {'code': '010102', 'name': '逻辑学', 'category': '哲学', 'degree': '哲学学士', 'years': 4},
    {'code': '010103K', 'name': '宗教学', 'category': '哲学', 'degree': '哲学学士', 'years': 4},
    
    # 经济学
    {'code': '020101', 'name': '经济学', 'category': '经济学', 'degree': '经济学学士', 'years': 4},
    {'code': '020102', 'name': '经济统计学', 'category': '经济学', 'degree': '经济学学士', 'years': 4},
    {'code': '020103', 'name': '国民经济管理', 'category': '经济学', 'degree': '经济学学士', 'years': 4},
    {'code': '020104', 'name': '资源与环境经济学', 'category': '经济学', 'degree': '经济学学士', 'years': 4},
    {'code': '020105', 'name': '商务经济学', 'category': '经济学', 'degree': '经济学学士', 'years': 4},
    {'code': '020106', 'name': '能源经济', 'category': '经济学', 'degree': '经济学学士', 'years': 4},
    {'code': '020201K', 'name': '金融学', 'category': '经济学', 'degree': '经济学学士', 'years': 4},
    {'code': '020202', 'name': '金融数学', 'category': '经济学', 'degree': '经济学学士', 'years': 4},
    {'code': '020203', 'name': '保险学', 'category': '经济学', 'degree': '经济学学士', 'years': 4},
    {'code': '020204', 'name': '投资学', 'category': '经济学', 'degree': '经济学学士', 'years': 4},
    {'code': '020205', 'name': '金融工程', 'category': '经济学', 'degree': '经济学学士', 'years': 4},
    {'code': '020206', 'name': '精算学', 'category': '经济学', 'degree': '经济学学士', 'years': 4},
    {'code': '020207', 'name': '互联网金融', 'category': '经济学', 'degree': '经济学学士', 'years': 4},
    {'code': '020208', 'name': '金融科技', 'category': '经济学', 'degree': '经济学学士', 'years': 4},
    {'code': '020301K', 'name': '国际经济与贸易', 'category': '经济学', 'degree': '经济学学士', 'years': 4},
    {'code': '020302', 'name': '贸易经济', 'category': '经济学', 'degree': '经济学学士', 'years': 4},
    
    # 法学
    {'code': '030101K', 'name': '法学', 'category': '法学', 'degree': '法学学士', 'years': 4},
    {'code': '030102', 'name': '知识产权', 'category': '法学', 'degree': '法学学士', 'years': 4},
    {'code': '030103', 'name': '监狱学', 'category': '法学', 'degree': '法学学士', 'years': 4},
    {'code': '030104', 'name': '信用风险管理与法律防控', 'category': '法学', 'degree': '法学学士', 'years': 4},
    {'code': '030201', 'name': '政治学与行政学', 'category': '法学', 'degree': '法学学士', 'years': 4},
    {'code': '030202', 'name': '国际政治', 'category': '法学', 'degree': '法学学士', 'years': 4},
    {'code': '030203', 'name': '外交学', 'category': '法学', 'degree': '法学学士', 'years': 4},
    {'code': '030204', 'name': '国际关系', 'category': '法学', 'degree': '法学学士', 'years': 4},
    {'code': '030301', 'name': '社会学', 'category': '法学', 'degree': '法学学士', 'years': 4},
    {'code': '030302', 'name': '社会工作', 'category': '法学', 'degree': '法学学士', 'years': 4},
    {'code': '030303', 'name': '人类学', 'category': '法学', 'degree': '法学学士', 'years': 4},
    {'code': '030304', 'name': '女性学', 'category': '法学', 'degree': '法学学士', 'years': 4},
    
    # 教育学
    {'code': '040101', 'name': '教育学', 'category': '教育学', 'degree': '教育学学士', 'years': 4},
    {'code': '040102', 'name': '科学教育', 'category': '教育学', 'degree': '理学学士', 'years': 4},
    {'code': '040103', 'name': '人文教育', 'category': '教育学', 'degree': '文学学士', 'years': 4},
    {'code': '040104', 'name': '艺术教育', 'category': '教育学', 'degree': '教育学学士', 'years': 4},
    {'code': '040106', 'name': '学前教育', 'category': '教育学', 'degree': '教育学学士', 'years': 4},
    {'code': '040107', 'name': '小学教育', 'category': '教育学', 'degree': '教育学学士', 'years': 4},
    {'code': '040108', 'name': '特殊教育', 'category': '教育学', 'degree': '教育学学士', 'years': 4},
    {'code': '040109', 'name': '教育技术学', 'category': '教育学', 'degree': '教育学学士', 'years': 4},
    {'code': '040201', 'name': '体育教育', 'category': '教育学', 'degree': '教育学学士', 'years': 4},
    {'code': '040202', 'name': '运动训练', 'category': '教育学', 'degree': '教育学学士', 'years': 4},
    {'code': '040203', 'name': '社会体育指导与管理', 'category': '教育学', 'degree': '教育学学士', 'years': 4},
    {'code': '040204', 'name': '武术与民族传统体育', 'category': '教育学', 'degree': '教育学学士', 'years': 4},
    {'code': '040205', 'name': '休闲体育', 'category': '教育学', 'degree': '教育学学士', 'years': 4},
    
    # 文学
    {'code': '050101', 'name': '汉语言文学', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050102', 'name': '汉语言', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050103', 'name': '汉语国际教育', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050104', 'name': '中国少数民族语言文学', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050105', 'name': '古典文献学', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050201', 'name': '英语', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050202', 'name': '俄语', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050203', 'name': '德语', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050204', 'name': '法语', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050205', 'name': '西班牙语', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050206', 'name': '阿拉伯语', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050207', 'name': '日语', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050208', 'name': '韩语', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050301', 'name': '新闻学', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050302', 'name': '广播电视学', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050303', 'name': '广告学', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050304', 'name': '传播学', 'category': '文学', 'degree': '文学学士', 'years': 4},
    {'code': '050305', 'name': '网络与新媒体', 'category': '文学', 'degree': '文学学士', 'years': 4},
    
    # 理学
    {'code': '070101', 'name': '数学与应用数学', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '070102', 'name': '信息与计算科学', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '070103', 'name': '数学与统计学', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '070201', 'name': '物理学', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '070202', 'name': '应用物理学', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '070301', 'name': '化学', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '070302', 'name': '应用化学', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '070401', 'name': '天文学', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '070501', 'name': '地理科学', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '070502', 'name': '自然地理与资源环境', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '070601', 'name': '大气科学', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '070701', 'name': '海洋科学', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '070801', 'name': '地球物理学', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '070901', 'name': '生物科学', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '070902', 'name': '生物技术', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '070903', 'name': '生物信息学', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '071001', 'name': '心理学', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '071101', 'name': '统计学', 'category': '理学', 'degree': '理学学士', 'years': 4},
    {'code': '071201', 'name': '系统科学与工程', 'category': '理学', 'degree': '理学学士', 'years': 4},
    
    # 工学（热门）
    {'code': '080101', 'name': '理论与应用力学', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080201', 'name': '机械工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080202', 'name': '机械设计制造及其自动化', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080203', 'name': '材料成型及控制工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080204', 'name': '机械电子工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080205', 'name': '工业设计', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080206', 'name': '过程装备与控制工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080207', 'name': '车辆工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080208', 'name': '汽车服务工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080301', 'name': '测控技术与仪器', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080401', 'name': '材料科学与工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080402', 'name': '材料物理', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080403', 'name': '材料化学', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080501', 'name': '能源与动力工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080502', 'name': '能源与环境系统工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080601', 'name': '电气工程及其自动化', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080701', 'name': '电子信息工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080702', 'name': '电子科学与技术', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080703', 'name': '通信工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080704', 'name': '微电子科学与工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080705', 'name': '光电信息科学与工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080706', 'name': '信息工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080707T', 'name': '广播电视工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080708T', 'name': '水声工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080801', 'name': '自动化', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080802', 'name': '轨道交通信号与控制', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080901', 'name': '计算机科学与技术', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080902', 'name': '软件工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080903', 'name': '网络工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080904K', 'name': '信息安全', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080905', 'name': '物联网工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080906', 'name': '数字媒体技术', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080907T', 'name': '智能科学与技术', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080908T', 'name': '空间信息与数字技术', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080910T', 'name': '大数据管理与应用', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080911TK', 'name': '网络空间安全', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080912T', 'name': '人工智能', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '080913T', 'name': '虎联网工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '081001', 'name': '土木工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '081002', 'name': '建筑环境与能源应用工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '081003', 'name': '给排水科学与工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '081004', 'name': '建筑电气与智能化', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '081005T', 'name': '城市地下空间工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '081006T', 'name': '道路桥梁与渡河工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '081101', 'name': '水利水电工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '081201', 'name': '测绘工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '081301', 'name': '化学工程与工艺', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '081401', 'name': '地质工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '081501', 'name': '采矿工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '081601', 'name': '纺织工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '081701', 'name': '轻化工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '081801', 'name': '交通工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '081802', 'name': '交通运输', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '081901', 'name': '船舶与海洋工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '082001', 'name': '航空航天工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '082002', 'name': '飞行器设计与工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '082101', 'name': '兵器科学与技术', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '082201', 'name': '核工程与核技术', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '082301', 'name': '农业工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '082401', 'name': '林业工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '082501', 'name': '环境工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '082502', 'name': '环境科学', 'category': '工学', 'degree': '理学学士', 'years': 4},
    {'code': '082601', 'name': '生物医学工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '082701', 'name': '食品科学与工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '082702', 'name': '食品质量与安全', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '082801', 'name': '建筑学', 'category': '工学', 'degree': '建筑学学士', 'years': 5},
    {'code': '082802', 'name': '城乡规划', 'category': '工学', 'degree': '工学学士', 'years': 5},
    {'code': '082803', 'name': '风景园林', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '082901', 'name': '安全工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    {'code': '083001', 'name': '生物工程', 'category': '工学', 'degree': '工学学士', 'years': 4},
    
    # 医学
    {'code': '100101K', 'name': '基础医学', 'category': '医学', 'degree': '医学学士', 'years': 5},
    {'code': '100201K', 'name': '临床医学', 'category': '医学', 'degree': '医学学士', 'years': 5},
    {'code': '100202', 'name': '麻醉学', 'category': '医学', 'degree': '医学学士', 'years': 5},
    {'code': '100203TK', 'name': '医学影像学', 'category': '医学', 'degree': '医学学士', 'years': 5},
    {'code': '100301K', 'name': '口腔医学', 'category': '医学', 'degree': '医学学士', 'years': 5},
    {'code': '100401K', 'name': '预防医学', 'category': '医学', 'degree': '医学学士', 'years': 5},
    {'code': '100501K', 'name': '中医学', 'category': '医学', 'degree': '医学学士', 'years': 5},
    {'code': '100601K', 'name': '中西医临床医学', 'category': '医学', 'degree': '医学学士', 'years': 5},
    {'code': '100701', 'name': '药学', 'category': '医学', 'degree': '理学学士', 'years': 4},
    {'code': '100702', 'name': '药物制剂', 'category': '医学', 'degree': '理学学士', 'years': 4},
    {'code': '100703K', 'name': '临床药学', 'category': '医学', 'degree': '理学学士', 'years': 5},
    {'code': '100704', 'name': '药事管理', 'category': '医学', 'degree': '管理学学士', 'years': 4},
    {'code': '100801', 'name': '中药学', 'category': '医学', 'degree': '理学学士', 'years': 4},
    {'code': '100901', 'name': '法医学', 'category': '医学', 'degree': '医学学士', 'years': 5},
    {'code': '101001', 'name': '医学检验技术', 'category': '医学', 'degree': '理学学士', 'years': 4},
    {'code': '101002', 'name': '医学影像技术', 'category': '医学', 'degree': '理学学士', 'years': 4},
    {'code': '101003', 'name': '眼视光学', 'category': '医学', 'degree': '理学学士', 'years': 4},
    {'code': '101004', 'name': '康复治疗学', 'category': '医学', 'degree': '理学学士', 'years': 4},
    {'code': '101005', 'name': '口腔医学技术', 'category': '医学', 'degree': '理学学士', 'years': 4},
    {'code': '101006', 'name': '卫生检验与检疫', 'category': '医学', 'degree': '理学学士', 'years': 4},
    {'code': '101101', 'name': '护理学', 'category': '医学', 'degree': '理学学士', 'years': 4},
    
    # 管理学
    {'code': '120101', 'name': '管理科学', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120102', 'name': '信息管理与信息系统', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120103', 'name': '工程管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120104', 'name': '房地产开发与管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120105', 'name': '工程造价', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120201K', 'name': '工商管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120202', 'name': '市场营销', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120203K', 'name': '会计学', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120204', 'name': '财务管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120205', 'name': '国际商务', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120206', 'name': '人力资源管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120207', 'name': '审计学', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120208', 'name': '资产评估', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120209', 'name': '物业管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120210', 'name': '文化产业管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120211', 'name': '体育经济与管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120212', 'name': '财务会计教育', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120213', 'name': '大数据管理与应用', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120301', 'name': '农林经济管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120302', 'name': '农村区域发展', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120401', 'name': '公共事业管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120402', 'name': '行政管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120403', 'name': '劳动与社会保障', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120404', 'name': '土地资源管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120405', 'name': '城市管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120406', 'name': '海关管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120501', 'name': '图书馆学', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120502', 'name': '档案学', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120601', 'name': '物流管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120602', 'name': '物流工程', 'category': '管理学', 'degree': '工学学士', 'years': 4},
    {'code': '120603', 'name': '采购管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120701', 'name': '工业工程', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120801', 'name': '电子商务', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120802', 'name': '电子商务及法律', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120901K', 'name': '旅游管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120902', 'name': '酒店管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    {'code': '120903', 'name': '会展经济与管理', 'category': '管理学', 'degree': '管理学学士', 'years': 4},
    
    # 艺术学
    {'code': '130201', 'name': '音乐表演', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130202', 'name': '音乐学', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130203', 'name': '作曲与作曲技术理论', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130204', 'name': '音乐教育', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130205', 'name': '录音艺术', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130301', 'name': '舞蹈表演', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130302', 'name': '舞蹈学', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130303', 'name': '舞蹈编导', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130401', 'name': '戏剧影视文学', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130402', 'name': '戏剧学', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130403', 'name': '表演', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130404', 'name': '导演', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130405', 'name': '戏剧影视导演', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130406', 'name': '广播电视编导', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130407', 'name': '摄影', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130408', 'name': '影视摄影与制作', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130501', 'name': '艺术设计学', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130502', 'name': '视觉传达设计', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130503', 'name': '环境设计', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130504', 'name': '产品设计', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130505', 'name': '服装与服饰设计', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130506', 'name': '公共艺术', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130507', 'name': '工艺美术', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130508', 'name': '数字媒体艺术', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130509', 'name': '艺术与科技', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130510', 'name': '美术学', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130511', 'name': '绘画', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130512', 'name': '雕塑', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130513', 'name': '摄影', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130601', 'name': '动画', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
    {'code': '130602', 'name': '漫画', 'category': '艺术学', 'degree': '艺术学学士', 'years': 4},
]

def fetch_gaokao_majors_online():
    """从掌上高考API获取专业数据"""
    majors = []
    
    for page in range(1, 50):
        try:
            url = "https://www.gaokao.cn/major/list"
            params = {'page': page, 'size': 20}
            resp = requests.get(url, params=params, headers={
                **HEADERS, 'Referer': 'https://www.gaokao.cn/'
            }, timeout=10)
            
            if resp.status_code != 200:
                break
            
            data = resp.json()
            items = data.get('data', {}).get('item', [])
            
            if not items:
                break
            
            for item in items:
                majors.append({
                    'id': str(item.get('specialtyId', '')),
                    'code': item.get('code', ''),
                    'name': item.get('name', ''),
                    'category': item.get('category', ''),
                    'degree': item.get('degree', ''),
                    'years': item.get('years', 4),
                    'employment_rate': item.get('employment_rate', ''),
                    'avg_salary': item.get('avg_salary', ''),
                    'source': 'gaokao_cn',
                })
            
            print(f"  掌上高考 第{page}页: {len(items)}个专业")
            if len(items) < 20:
                break
            time.sleep(0.3)
        except Exception as e:
            print(f"  掌上高考专业 第{page}页 失败: {e}")
            break
    
    return majors


if __name__ == '__main__':
    print("=== 开始爬取专业数据 ===")
    
    # 在线爬取
    print("\n[1/2] 掌上高考在线专业数据...")
    online_majors = fetch_gaokao_majors_online()
    print(f"  在线获取: {len(online_majors)} 个专业")
    
    # 合并本地权威数据
    print("\n[2/2] 合并教育部权威专业目录...")
    all_majors = MAJORS_DATA.copy()
    
    # 用在线数据补充信息
    online_map = {m['name']: m for m in online_majors}
    for major in all_majors:
        if major['name'] in online_map:
            online_info = online_map[major['name']]
            major['employment_rate'] = online_info.get('employment_rate', '')
            major['avg_salary'] = online_info.get('avg_salary', '')
    
    # 添加在线专有专业
    local_names = {m['name'] for m in all_majors}
    for m in online_majors:
        if m['name'] not in local_names:
            all_majors.append(m)
    
    print(f"  最终专业数: {len(all_majors)}")
    
    with open('/home/runner/workspace/data/raw/majors_raw.json', 'w', encoding='utf-8') as f:
        json.dump(all_majors, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 专业数据处理完成，共 {len(all_majors)} 个专业")
