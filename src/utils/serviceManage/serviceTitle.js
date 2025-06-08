export const ServiceInfoOptions = [
    {
        label: '文字（100文字まで）',
        value: 1,
        disabled: false,
        visible: true
    },
    {
        label: 'カタカナ（100文字まで）',
        value: 2,
        disabled: false,
        visible: true
    },
    {
        label: 'メールアドレス',
        value: 3,
        disabled: false,
        visible: true
    },
    {
        label: '日付',
        value: 4,
        disabled: false,
        visible: true
    },
    {
        label: '数字',
        value: 5,
        disabled: false,
        visible: true
    },
    {
        label: 'チェックボックス',
        value: 6,
        disabled: false,
        visible: true
    }
]
export const showedInfoCols = [
    {
        title: '項目番号',
        key: 'id',
        width: 150,
        type: 'number',
        span: 4,
    },
    {
        title: '項目名',
        key: 'field',
        width: 200,
        type: 'text',
        span: 4,
    },
    {
        title: '項目タイプ',
        key: 'type',
        width: 200,
        type: 'select',
        span: 10,
    },
    {
        title: '必須',
        key: 'checkbox',
        width: 20,
        type: 'checkBox',
        span: 2,
    }, 
    {
        title: 'アクション',
        key: '',
        type: 'action',
        width: 200,
        span: 4,
    }
]


export const showedConditionCols = [
    {
        title: '項目番号',
        key: 'id',
        width: 150,
        type: 'text',
        span: 4,
    },
    {
        title: '条件文言',
        key: 'description',
        width: 200,
        type: 'textarea',
        span: 16,
    },
    {
        title: 'アクション',
        key: '',
        type: 'action',
        width: 200,
        span: 4,
    }
]

export const showedFilelimitCols = [
    {
        title: '項目番号',
        key: 'id',
        width: 150,
        type: 'text',
        span: 4,
    },
    {
        title: '表示名',
        key: 'filelimitName',
        width: 200,
        type: 'text',
        span: 4,
    },
    {
        title: 'ファイル条件',
        key: 'fileCondition',
        width: 200,
        type: 'text',
        span: 8,
    },
    {
        title: 'アクション',
        key: '',
        type: 'action',
        width: 180,
        span: 6,
    }
]

export const showedFilelimitCols2 = [
    // {
    //     title: '名簿',
    //     key: 'allowSet',
    //     width: 40,
    //     type: 'radio',
    //     span: 2,
    // },
    {
        title: '項目番号',
        key: 'id',
        width: 150,
        type: 'text',
        span: 4,
    },
    {
        title: '表示名',
        key: 'filelimitName',
        width: 200,
        type: 'text',
        span: 4,
    },
    {
        title: 'ファイル条件',
        key: 'fileCondition',
        width: 200,
        type: 'text',
        span: 8,
    },
    {
        title: 'アクション',
        key: '',
        type: 'action',
        width: 180,
        span: 6,
    }
]