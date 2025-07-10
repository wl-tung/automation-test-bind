export const SiteEditorConfig = {
  // URLs
  WEBLIFE_AUTH_URL: 'https://mypage.weblife.me/auth/',
  SITE_THEATER_URL: 'https://edit3.bindcloud.jp/bindcld/siteTheater/',
  
  // Timeouts (in milliseconds)
  TIMEOUTS: {
    PAGE_LOAD: 120000,
    ELEMENT_WAIT: 15000,
    SHORT_WAIT: 3000,
    MEDIUM_WAIT: 5000,
    LONG_WAIT: 10000,
    BLOCK_OPERATION: 3000,
    IFRAME_INTERACTION: 1500
  },
  
  // Selectors
  SELECTORS: {
    AUTH: {
      LOGIN_ID: '#loginID',
      LOGIN_PASS: '#loginPass',
      LOGIN_BUTTON: 'a.buttonL.btnLogin',
      BINDUP_LAUNCH: '[name="BiNDupを起動"]'
    },
    
    POPUPS: {
      START_GUIDE_1: '#button-1014',
      START_GUIDE_2: '#button-1031',
      SITE_EDIT_BUTTON: 'text=サイトを編集'
    },
    
    SITE_THEATER: {
      SITE_LIST: '#id-exist-mysite .cs-item[draggable="true"]',
      EDIT_BUTTON: '.cs-select.cs-click'
    },
    
    SITE_EDITOR: {
      INDICATORS: [
        'text=サイトエディタ',
        'text=ページ編集',
        'text=デザイン編集',
        'text=プレビュー',
        'text=完了'
      ],
      PAGE_EDIT_BUTTONS: [
        'text=ページ編集',
        'button:has-text("ページ編集")',
        '[title*="ページ編集"]',
        'text=編集',
        'button:has-text("編集")'
      ]
    },
    
    IFRAME: {
      PREVIEW: 'iframe[name="preview"]',
      BLOCK_TEMPLATE: 'iframe[name="blockTemplate"]',
      BILLBOARD_BLOCK: '.b-plain.cssskin-_block_billboard',
      ADD_MENU_BUTTON: '#block_addmenu',
      TEMPLATE_SELECTOR: '#bktmp429 div'
    },
    
    BLOCK_OPERATIONS: {
      BLANK_BLOCK: '空白ブロックを下に追加',
      SHARED_BLOCK: '共有ブロックを下に追加',
      TEMPLATE_BLOCK: ['ブロックテンプレートから選択', 'テンプレートから選択', 'テンプレート']
    },
    
    DIALOGS: {
      SHARED_BLOCK_SELECT: '#selTextSelect',
      FOOTER_MENU_LINK: '_フッタメニュー',
      APPLY_BUTTON: '#button-1037',
      TEMPLATE_APPLY: '適用'
    }
  },
  
  // Performance settings
  PERFORMANCE: {
    REDUCE_WAITS: true,
    PARALLEL_OPERATIONS: false,
    SMART_RETRIES: true,
    MAX_RETRIES: 3
  }
};

export type SiteEditorConfigType = typeof SiteEditorConfig;
