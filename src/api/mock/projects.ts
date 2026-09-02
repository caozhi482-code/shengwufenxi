export interface Project {
  id: string;
  code: string;
  name: string;
  department: string;
  manager: string;
  researchArea: string;
  status: 'active' | 'archived';
}

export const projects: Project[] = [
  { id: 'PRJ001', code: 'BRH-BIO-2025-001', name: '布洛芬 bio 分析项目', department: '生物分析部', manager: '武琴', researchArea: '药代动力学', status: 'active' },
  { id: 'PRJ002', code: 'BRH-BIO-2025-002', name: '巴瑞替尼方法学验证', department: '生物分析部', manager: '武琴', researchArea: '方法学验证', status: 'active' },
  { id: 'PRJ003', code: 'BRH-BIO-2025-003', name: '奥司他韦稳定性研究', department: '稳定性研究组', manager: '陈明', researchArea: '稳定性', status: 'active' },
  { id: 'PRJ004', code: 'BRH-BIO-2025-004', name: '帕拉米韦生物分析', department: '生物分析部', manager: '武琴', researchArea: '药代动力学', status: 'active' },
  { id: 'PRJ005', code: 'BRH-BIO-2024-018', name: '瑞德西韦残留溶剂检测', department: '质量控制组', manager: '李华', researchArea: '质量控制', status: 'archived' },
];

export function getProjectsByManager(manager: string): Project[] {
  return projects.filter(p => p.manager === manager && p.status === 'active');
}

export function searchProjects(query: string): Project[] {
  if (!query) return projects.filter(p => p.status === 'active');
  const q = query.toLowerCase();
  return projects.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.code.toLowerCase().includes(q) ||
    p.department.toLowerCase().includes(q)
  );
}
