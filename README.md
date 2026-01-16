# IsingViz - 量子能量景观可视化平台

基于论文《组合优化问题在Ising机器中的能量景观》，实现完整的Ising/QUBO模型、断连图分析、GWL采样算法可视化。

![IsingViz Banner](screenshots/banner.png)

## 本项目由[阿里云ESA](https://www.aliyun.com/product/esa)提供加速、计算和保护

![阿里云ESA](https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png)

---

## 核心功能

### 1. Ising模型模拟器
- 可交互的2D自旋晶格系统
- 实时Metropolis-Hastings采样
- 能量变化可视化
- 支持自定义耦合强度和温度

### 2. QUBO/PUBO优化器
- 随机QUBO矩阵生成
- 模拟退火求解
- QUBO到Ising模型的等价转换
- 矩阵热力图可视化

### 3. k-SAT问题生成器
- 随机CNF公式生成
- SAT到QUBO的转换
- 可满足性检验
- 相变理论可视化（α_c临界值）

### 4. 断连图(Disconnectivity Graph)
- 局部极小值搜索
- 鞍点和能量势垒计算
- 树状能量景观可视化
- 漏斗结构vs玻璃态分析

### 5. 模拟退火算法
- 多种冷却调度（指数/线性/对数）
- 能量和温度双轴实时曲线
- 参数敏感性分析
- Metropolis接受准则可视化

### 6. GWL采样算法
- Wang-Landau态密度估计
- 平坦直方图实时监控
- 修改因子自适应调整
- 高效越势垒采样

---

## How We Use Edge

本项目深度利用阿里云ESA边缘计算能力，实现了以下边缘优化：

### 边缘函数 - 计算卸载
```
/api/compute - 边缘端量子模型计算
```
- **Ising能量计算**：将哈密顿量 H = -Σ Jij·si·sj 的计算卸载到边缘节点，减少客户端负担
- **QUBO能量评估**：边缘端执行 f(x) = Σ Qij·xi·xj 的矩阵运算
- **模拟退火求解**：在边缘节点运行完整的SA算法，利用边缘计算资源

### 边缘函数 - AI辅助
```
/api/chat - 边缘端AI代理
```
- 通过边缘函数代理调用通义千问API
- 为用户提供量子计算概念的实时解释
- 边缘端处理API密钥，保护用户隐私

### 边缘优势
1. **低延迟**：计算在距离用户最近的边缘节点执行，显著降低响应时间
2. **高并发**：边缘分布式架构支持大规模并发访问
3. **安全性**：API密钥存储在边缘环境变量中，不暴露给客户端
4. **全球加速**：ESA CDN确保静态资源在全球范围内快速加载

---

## 技术栈

### 前端
- **React 18** + TypeScript
- **Vite** 构建工具
- **Tailwind CSS** 样式框架
- **Framer Motion** 动画库
- **D3.js** 数据可视化
- **Plotly.js** 3D图表
- **Zustand** 状态管理

### 边缘函数
- **TypeScript** 边缘函数
- **ESA Pages Functions** 运行时
- **通义千问 API** 集成

---

## 理论基础

### Ising哈密顿量
```
H = -Σ Jij·si·sj - Σ hi·si
```
其中 si ∈ {-1, +1} 是自旋变量，Jij 是耦合系数，hi 是外场。

### QUBO模型
```
f(x) = Σ Qij·xi·xj
```
其中 xi ∈ {0, 1} 是二元变量，等价于Ising模型（变换: si = 2xi - 1）。

### 断连图
断连图是能量景观的树状表示，通过能量势垒将局部极小值连接起来。它揭示了优化问题的难度：
- **漏斗状景观**：单一主导盆地，容易收敛到全局最优
- **玻璃态景观**：多个相互竞争的局部极小，难以逃逸

### Wang-Landau算法
通过迭代修正态密度估计 g(E)，实现平坦直方图采样：
- 接受概率: P ∝ g(E)/g(E')
- 更新权重: g(E) → f·g(E)
- 当直方图足够平坦时减小修改因子 f

---

## 本地开发

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

---

## 项目结构

```
23_IsingViz_量子能量景观可视化/
├── frontend/
│   ├── src/
│   │   ├── components/     # UI组件
│   │   │   ├── IsingGrid.tsx          # Ising自旋网格
│   │   │   ├── EnergyLandscape3D.tsx  # 3D能量景观
│   │   │   ├── DisconnectivityGraph.tsx # 断连图
│   │   │   ├── AnnealingVisualizer.tsx  # 退火可视化
│   │   │   └── SettingsModal.tsx      # 设置弹窗
│   │   ├── pages/          # 页面
│   │   │   ├── IsingPage.tsx    # Ising模型
│   │   │   ├── QUBOPage.tsx     # QUBO优化
│   │   │   ├── SATPage.tsx      # k-SAT生成
│   │   │   ├── DGPage.tsx       # 断连图
│   │   │   ├── AnnealingPage.tsx # 模拟退火
│   │   │   └── GWLPage.tsx      # GWL采样
│   │   ├── utils/          # 核心算法
│   │   │   ├── ising.ts         # Ising模型
│   │   │   ├── qubo.ts          # QUBO模型
│   │   │   ├── sat.ts           # SAT问题
│   │   │   ├── annealing.ts     # 模拟退火
│   │   │   └── disconnectivity.ts # 断连图算法
│   │   └── store/          # 状态管理
│   └── public/
├── functions/
│   └── api/
│       ├── chat.ts         # AI对话边缘函数
│       └── compute.ts      # 计算卸载边缘函数
├── esa.jsonc               # ESA配置
└── README.md
```

---

## 参考文献

1. 论文：《组合优化问题在Ising机器中的能量景观》
2. Wang, F. & Landau, D. P. (2001). Efficient, Multiple-Range Random Walk Algorithm to Calculate the Density of States. Physical Review Letters.
3. Kirkpatrick, S., Gelatt, C. D., & Vecchi, M. P. (1983). Optimization by Simulated Annealing. Science.

---

## 许可证

MIT License
