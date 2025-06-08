
const test = {
    "status": "success",
    "data": [
      {
        "file_name": "申請書.pdf",
        "file_url": "https:\\www.xxx.com/fesp89s31.pdf",
        "page_data": [
          {
            "file_page": 1,
            "file_image": "https:\\www.xxx.com/fesp89s31_1.jpg",
            "field_data": [
              {
                "field_name": "申請日",
                "field_value": "2021-01-01",
                "field_location": [100, 200, 300, 400],
                "confirm_status": 0,
                "confirm_user": "",
                "confirm_date": ""
              },
              {
                "field_name": "申請者",
                "field_value": "田中太郎",
                "field_location": [100, 200, 300, 400],
                "confirm_status": 1,
                "confirm_user": "admin",
                "confirm_date": "2021-01-01 12:00:00"
              }
            ]
          },
          {
            // file 1 page 2 ...
          }
        ]
      },
      {
        // file 2 ...
      }
    ]
  }
  
  const postService = { 
    service_name: "申請書",
    local_upload: true,  
    status: 1, // 0 is not public, 1 is completed
    service_title: "申請MyNumberCard",
    service_desc: "MyNumberCard <br> 申請書を提出してください",
    need_OCR: true,
    need_system: true,
    status: 2, // 0  1, // 2
    trigger_type: 0, // 0 is automatic, 1 is all of the conditions are met
    web_upload: true, 
    enforce_OCR: false,  
    user_id: 24324
}
  
  // 担当者業務一覧
  const respones = {
    code: 200,
    message : "success",
    data: {
      service_data: [
        {
          service_id: 1,
          service_name: "申請書",
          local_upload: true,
          web_upload: false,
        },
        {
          // service 2 ...
        }
      ] 
    }
  }
  
  const saveForm = { // as a application
    service_id: 1,
    user_id: 1,
    created_time: "2021-01-01 12:00:00",
    status: 0, // 0 is not finished, 1 is completed
    field_data: [
      {
        name: "申請日",
        value: "2021-01-01"
      },
      {
        name: "申請者",
        value: "田中太郎"
      },
    ],
    condition_data: [
      {
        condition_id: 1,
        check_status: 1,
      },
      {
        condition_id: 2,
        check_status: 0,
      },
    ],
    file_data: [
      {
        related_file_id: 1,
        file_name: "申請書.pdf",
        file_id: 3, // foriegn key
        file_url: "https:\\www.xxx.com/fesp89s31.pdf",
        file_size: 1024,
      },
      {
        related_file_id: 1,
        file_name: "申請書.pdf",
        file_id: 0, 
        file_url: "",
        file_size: 1024,
      },
      // ...
    ]
  } 
  
  const saveResponse = {
    code: 200,
    message: "success", // or "error"
    data: {
      status: "申請書保存成功", // or "申請書保存失敗"
    }
  }
  
  const dijipathRefresh = { 
      code: 200,
      message: "success",
      data: {
        applications_data: [
        {
          application_id: 3435,
          user_id: 1234,
          created_datetime: "2023-05-15",
          status: 0, // 0 is not finished, 1 is completed, 2 is in progress, 3 is rejected
          description: "Renewal of driver's license"
        },
        {
          application_id: 323343,
          user_id: 32357,
          created_datetime: "2023-08-20",
          status: 0, // 0 is not finished, 1 is completed, 2 is in progress, 3 is rejected
          description: "Application for building permit"
        }
      ]
    } 
  } 
      
  
    const reqSentoDijiPath = {
      application_id: 3435,
      user_id: 1234,
      created_datetime: "2023-05-15 12:00:00",
    }
  
  const resSentoDijiPath = {
    code: 200,
    message: "success",
    data: {
        // 刷新申请状态和 获取申请数据一致
        application_id: 3435,
        user_id: 1234,
        created_datetime: "2023-05-15",
        status: 2, // 0 is not finished, 1 is completed, 2 is in progress, 3 is rejected
      }
  }
  
  const reqReviewResult = {
    code: 200,
    message: "success",
    application_id: 3435,
    user_id: 1234 
  }
  
  const resReviewResult = {
    code: 200,
    message: "success",
    data: {
      application_id: 3435,
      user_id: 1234,
      // only one object
      ocr_status: 2, // 0 未开始, 1 进行中, 2 完了
      ocr_datetime: "2023-05-15 12:00:00",
      review_status: 2, // 0 未开始, 1 正常, 2 異常あり
      review_datetime: "2023-05-15 12:00:00",
      flow_picture_url: "", // どうやって保存する？ width and height need limited
      review_info: "申請書の内容に異常があります。1. ... 2....", // 異常内容
      field_data: [
        {
          field_name: "申請日",
          field_value: "2021-01-01",
          review_status: 1 // normal
        },
        {
          field_name: "申請者",
          field_value: "田中太郎",
          review_status: 0 // error
        } 
      ]
    } 
  }
  
  const reqOCRDetail = {
    code: 200,
    message: "success",
    application_id: 3435,
    user_id: 1234 
  }
  
  const getOCRDetail = {
    code: 200,
    message: "success",
    data: {
        application_id: 3435,
        user_id: 1234,
        file_id: 3,
        file_name: "申請書.pdf",
        page_data: [
          {
            file_page: 1,
            file_image: "https:\\www.xxx.com/fesp89s31_1.jpg",
            field_data: [
              {
                field_name: "申請日",
                field_value: "2021-01-01",
                field_location: [100, 200, 300, 400],
                confirm_status: 0,
                confirm_user: "",
                confirm_date: ""
              },
              {
                field_name: "申請者",
                field_value: "田中太郎",
                field_location: [100, 200, 300, 400],
                confirm_status: 1,
                confirm_user: "admin",
                confirm_date: "2021-01-01 12:00:00"
              }
            ]
          },
          {
            // file 1 page 2 ...
          }
        ]
      }
  }
  