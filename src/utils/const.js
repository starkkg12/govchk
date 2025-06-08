import { Management } from "@element-plus/icons-vue"

const SYSUSER_STATUS ={

    using:0,  // 利用可能
    stop:1　　// 利用不可
}

const ROLE_STATUS = {
    using:0,  // 利用可能
    stop:1　　// 利用不可
}

//強制的なOCRを実行するか
const ENFORCE_OCR = {
    YES:0,
    NO:1
}

//一括申請
const ALLOW_SET = {
    YES:0, //可
    NO:1   //不可
}

//審査システム実行するか
const CHECKSYSTEM = {
    YES:0, //はい
    NO:1   //いいえ
}

const OPEN_STATUS = {
    OPEN:1, //公開
    UNOPEN:0   //未公開
}

const LIMIT_MULTI  ={
    YES:0, //複数可
    NO:1   //不可
}

const ROLE ={
    ADMIN:1,
    GOV_MANAGEMENT:2,
    GENERAL_USER:3,
    BPO_USER:4,
}

const ROLE_GROUP={
    MANAGER:0,
    GENERAL:1
}
const SYS_NOTICE_TYPE={
    MANTANCE:0 , // メンテナンス 
    NOTICE:1   //お知らせ

}
const ROLE_LAYER = {
    ADMIN:0,
    GENERAL:1
}
const ROLE_KEY ={
    "SCFTAdmin":1,
    "BPO":2,
    "govAdmin":3,
    "organization":4,
    "govOperator":5
}

// 自動審査
const AUTO_REVIEW={
    YES:0,
    NO:1
}

const ENFORCE_OCR_LIST= [
    { label: "実施する", value: 0, type: "success" },
    { label: "実施しない", value: 1, type: "info" },
]

const AUTO_REVIEW_LIST= [
    { label: "実施する", value: 0, type: "success" },
    { label: "実施しない", value: 1, type: "info" },
]
// 自治体有効フラグ
const GOV_STATUS={
    YES:0,
    NO:1
}

const STATUS_LIST = [
    { label: "未提出", value: 0, type: "danger" },
    { label: "受付中", value: 1, type: "success" },
    { label: "振り分け", value: 2, type: "info" },
    { label: "検査中", value: 3, type: "info" },
    { label: "Progress Bar表示", value: 4, type: "info" },
    { label: "完了", value: 5, type: "success" },
    { label: "エラー", value: 99, type: "danger" },
  ];

const APPLOCATION_STATUS_LIST = [
    { label: "未提出", value: 0, type: "danger" },
    { label: "受付中", value: 1, type: "success" },
    { label: "データ化処理中", value: 2, type: "info" },
    { label: "データ化完了", value: 5, type: "success" },
    { label: "審査中", value: 6, type: "info" },
    { label: "審査完了", value: 7, type: "success" },
    { label: "エラー", value: 99, type: "danger" },
  ];

const DEFAULT_TASK_DESCRIPTION = "&lt;h4&gt;     以下の手続きと注意事項をご確認ください。&lt;/h4&gt;&lt;h5&gt;      注意事項：&lt;/h5&gt;&lt;h5&gt;&lt;span class=&quot;ql-font-monospace&quot; style=&quot;background-color: rgb(255, 251, 255); color: rgb(33, 26, 29);&quot;&gt;       ① 住民票の写しを持参してください。&lt;/span&gt;&lt;/h5&gt;&lt;h5&gt;&lt;span class=&quot;ql-font-monospace&quot; style=&quot;background-color: rgb(255, 251, 255); color: rgb(33, 26, 29);&quot;&gt;       ② 身分証明書を持参してください。&lt;/span&gt;&lt;/h5&gt;&lt;h5&gt;&lt;span class=&quot;ql-font-monospace&quot; style=&quot;background-color: rgb(255, 251, 255); color: rgb(33, 26, 29);&quot;&gt;       ③ 身分証明書を持参してください。&lt;/span&gt;&lt;/h5&gt;&lt;p&gt;&lt;br&gt;&lt;/p&gt;&lt;p&gt;&lt;span class=&quot;ql-font-monospace&quot; style=&quot;background-color: rgb(255, 251, 255); color: rgb(33, 26, 29);&quot;&gt;&lt;span class=&quot;ql-cursor&quot;&gt;﻿﻿﻿﻿﻿﻿&lt;/span&gt;&lt;/span&gt;&lt;/p&gt;";

// 一般ユーザーのリクエスト表示
const GENERALUSERAPPLICATION = {
    ALL: 0 , //組織内すでユーザーに許可
    SELF: 1, //自分のみ
}

export { SYSUSER_STATUS ,ROLE_STATUS,ENFORCE_OCR,ALLOW_SET,CHECKSYSTEM,OPEN_STATUS,LIMIT_MULTI,ROLE,ROLE_GROUP,SYS_NOTICE_TYPE,ROLE_LAYER,ROLE_KEY,AUTO_REVIEW,STATUS_LIST,GOV_STATUS, APPLOCATION_STATUS_LIST, DEFAULT_TASK_DESCRIPTION, GENERALUSERAPPLICATION, ENFORCE_OCR_LIST, AUTO_REVIEW_LIST}
