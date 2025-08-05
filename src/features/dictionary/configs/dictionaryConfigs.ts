import type { DictionaryConfigs } from '../types/dictionary.types'

export const dictionaryConfigs: DictionaryConfigs = {
  user: {
    name: '사용자 사전',
    apiPath: '/users',
    theme: {
      color: 'purple',
      iconName: 'User'
    },
    fields: ['keyword'],
    validation: {
      keyword: (value) => value.trim() !== ''
    },
    features: {
      realtimeSync: false
    },
    messages: {
      placeholder: {
        keyword: '사용자 단어를 입력하세요 (예: 브랜드명, 제품명)'
      },
      validationError: {
        keyword: '키워드를 입력해주세요.'
      },
      deleteConfirm: '사용자 단어를 삭제하시겠습니까?',
    }
  },
  
  stopword: {
    name: '불용어 사전',
    apiPath: '/stopwords',
    theme: {
      color: 'orange',
      iconName: 'Ban'
    },
    fields: ['keyword'],
    validation: {
      keyword: (value) => /^[^\s,]+$/.test(value.trim())
    },
    features: {
      realtimeSync: false
    },
    messages: {
      placeholder: {
        keyword: '불용어를 입력하세요 (예: 그)'
      },
      validationError: {
        keyword: '불용어는 단일 단어로 입력해주세요. (콤마나 특수문자 불가)'
      },
      deleteConfirm: '불용어를 삭제하시겠습니까?',
    }
  },
  
  synonym: {
    name: '동의어 사전',
    apiPath: '/synonyms',
    theme: {
      color: 'blue',
      iconName: 'GitBranch'
    },
    fields: ['keyword', 'synonyms'],
    validation: {
      keyword: (value) => value.trim() !== '',
      synonyms: (value) => value && value.length > 0
    },
    features: {
      realtimeSync: true,
      customRenderer: 'synonym'
    },
    messages: {
      placeholder: {
        keyword: '대표어를 입력하세요',
        synonyms: '동의어를 입력하세요 (콤마로 구분)'
      },
      validationError: {
        keyword: '대표어를 입력해주세요.',
        synonyms: '동의어를 하나 이상 입력해주세요.'
      },
      deleteConfirm: '동의어 그룹을 삭제하시겠습니까?',
      applyConfirm: '변경사항을 실시간으로 반영하시겠습니까?',
      applySuccess: '동의어 사전이 실시간으로 반영되었습니다.'
    }
  },
  
  typo: {
    name: '오타교정 사전',
    apiPath: '/typo-corrections',
    theme: {
      color: 'green',
      iconName: 'CheckCircle'
    },
    fields: ['keyword', 'correctedWord'],
    validation: {
      keyword: (value) => value.trim() !== '',
      correctedWord: (value) => value.trim() !== ''
    },
    features: {
      realtimeSync: true,
      customRenderer: 'typo'
    },
    messages: {
      placeholder: {
        keyword: '오타를 입력하세요',
        correctedWord: '교정어를 입력하세요'
      },
      validationError: {
        keyword: '오타 단어를 입력해주세요.',
        correctedWord: '교정어를 입력해주세요.'
      },
      deleteConfirm: '오타교정을 삭제하시겠습니까?',
      applyConfirm: '변경사항을 실시간으로 반영하시겠습니까?',
      applySuccess: '오타교정 사전이 실시간으로 반영되었습니다.'
    }
  }
}

export function getDictionaryConfig<K extends keyof DictionaryConfigs>(type: K): DictionaryConfigs[K] {
  return dictionaryConfigs[type]
}