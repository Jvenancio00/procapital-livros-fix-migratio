import type { Dictionary } from "@/lib/i18n/types";

export const zh: Dictionary = {
  meta: { htmlLang: "zh-CN" },
  nav: {
    home: "首页",
    catalog: "图书目录",
    publishers: "出版社",
    about: "关于我们",
    blog: "博客",
    contacts: "联系方式",
    categories: "分类",
    agreements: "合作伙伴",
    highlights: "精选好书",
    bestsellers: "畅销书",
    digitalBook: "电子书",
    events: "活动",
    myLibrary: "我的书库",
    logout: "退出登录",
    login: "登录",
    clientArea: "客户专区",
    contactUs: "联系我们",
    favorites: "收藏夹",
    cart: "购物车",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    language: "语言",
    currency: "货币",
  },
  hero: {
    badge: "认证经销商 · 葡语国家共同体",
    title: "把合适的书，带给寻找它的人。",
    subtitle: "多元化的图书目录，覆盖葡语国家共同体的配送服务，以及与各大出版社的官方合作。",
    ctaCatalog: "查看图书目录",
    ctaClientArea: "客户专区",
    highlightsLabel: "本周精选",
    deliveryNote: "配送至 莫桑比克 · 安哥拉 · 葡萄牙 · 巴西",
    stats: [
      { value: "50+", label: "合作出版社" },
      { value: "1000+", label: "在架书目" },
      { value: "4", label: "服务国家" }
    ],
    scroll: "向下浏览",
    playFilm: "播放影片",
    pauseFilm: "暂停影片",
    posterAlt:
      "黄昏时分的书店内景：木质书架摆满图书，阳光斜射，读者正在挑选书籍。",
  },
  search: {
    placeholder: "按书名、作者或分类搜索...",
    button: "搜索",
    categoryAll: "全部",
  },
  categories: {
    Escolar: "教材",
    Ficção: "小说",
    Infantil: "儿童读物",
    "Não-ficção": "非小说类",
  },
  bookCard: {
    viewDetails: "查看详情",
    addToCart: "加入购物车",
    download: "下载",
    free: "免费",
    addToFavorites: "加入收藏",
    removeFromFavorites: "取消收藏",
  },
  catalog: {
    noResults: "未找到符合搜索条件的图书。",
    previous: "上一页",
    next: "下一页",
    pageOf: "第 {page} 页，共 {total} 页",
  },
  footer: {
    tagline: "一家服务于莫桑比克及葡语国家共同体书店、学校和读者的图书经销商。",
    navigationTitle: "导航",
    contactsTitle: "联系方式",
    rights: "版权所有，保留一切权利。",
  },
  trustBar: {
    items: [
      {
        title: "配送至整个葡语国家共同体",
        description: "莫桑比克、安哥拉、葡萄牙、巴西及其他国家。",
      },
      {
        title: "官方合作",
        description: "我们直接与持牌出版社合作。",
      },
      {
        title: "精选目录",
        description: "每个类别均由专家审核精选。",
      },
      {
        title: "专属支持",
        description: "为书店和学校提供的销售团队支持。",
      },
    ],
  },
  partnerMarquee: {
    trustText: "4个国家50多家出版社的信赖之选",
  },
  audience: {
    title: "为读者服务",
    description: "我们为每个细分市场量身定制服务，确保高效且个性化的解决方案。",
    items: [
      {
        title: "书店",
        description: "面向全国经销商的丰富目录和优惠的商业条件。",
      },
      {
        title: "学校",
        description: "教材及教学辅助材料，供应节奏配合学校日历。",
      },
      {
        title: "大众读者",
        description: "为寻找特定书目或阅读推荐的读者提供直接支持。",
      },
    ],
  },
  testimonials: {
    eyebrow: "信赖",
    title: "与我们合作的伙伴，都选择继续留下",
    description: "多个国家的书店、学校和合作伙伴都信赖 Pro Capital 提供稳定的图书供应。",
    items: [
      {
        quote: "Pro Capital 已成为我们信赖的供应商。交货期准时，目录几乎涵盖了客户所需的一切。",
        name: "Livraria Central",
        role: "合作书店 · 马普托，莫桑比克",
      },
      {
        quote: "有了 Pro Capital，我们可以规划整个学年。教材在开学前送达，并为学校提供公平的商业条件。",
        name: "Colégio Horizonte",
        role: "教育机构 · 马普托，莫桑比克",
      },
      {
        quote: "从葡萄牙向莫桑比克市场下单不再复杂。沟通清晰，物流跟踪专业。",
        name: "Livraria Atlântico",
        role: "国际客户 · 里斯本，葡萄牙",
      },
    ],
  },
  home: {
    bestsellers: {
      eyebrow: "热门",
      title: "畅销书",
      description: "书店、学校和读者最常搜索的书目。",
      viewAll: "查看完整目录",
    },
    catalogSection: {
      eyebrow: "浏览",
      title: "图书目录",
      description: "按分类浏览，或查看含价格的完整目录。",
      viewAll: "查看完整目录",
    },
    highlights: {
      eyebrow: "本月精选",
      title: "本月图书",
      description: "来自我们目录的精选推荐。",
      viewAll: "查看完整目录",
    },
    whatWeDo: {
      eyebrow: "为什么选择我们",
      title: "我们的服务",
      description: "我们是出版社与读者之间的纽带——从仓库到读者手中，我们负责图书分销的每一个环节。",
      items: [
        {
          title: "库存管理",
          description: "我们维持书目的可用性和条理性，确保合适的书在合适的时间不会缺货。",
        },
        {
          title: "葡语国家共同体分销",
          description: "配送至莫桑比克的书店和学校，业务遍及安哥拉、葡萄牙、巴西及其他葡语国家共同体国家。",
        },
        {
          title: "商务洽谈",
          description: "为经销商、学校和出版合作伙伴提供清晰公平的条件。",
        },
        {
          title: "目录推广",
          description: "我们向合作伙伴推广我们所代理出版社的新书和目录。",
        },
      ],
    },
    presence: {
      eyebrow: "国际版图",
      title: "一家经销商，四个国家",
      description: "总部位于莫桑比克，为安哥拉、葡萄牙、巴西及其他葡语国家共同体国家的书店、学校和出版社提供常态化服务。",
      countries: [
        {
          country: "莫桑比克",
          note: "总部 · 马普托",
        },
        {
          country: "安哥拉",
          note: "罗安达",
        },
        {
          country: "葡萄牙",
          note: "里斯本",
        },
        {
          country: "巴西",
          note: "巴西利亚",
        },
      ],
    },
    ctaBottom: {
      title: "聊聊您的下一份图书订单？",
      description: "无论是书店、学校还是个人读者——我们随时为您提供帮助，在任何葡语国家共同体国家找到合适的书目。",
      button: "联系 Pro Capital",
    },
    newsletter: {
      title: "获取最新上架图书和目录动态",
      description: "偶尔发送的邮件，介绍新书和合作出版社。",
      placeholder: "您的邮箱",
      button: "订阅",
    },
  },
};
