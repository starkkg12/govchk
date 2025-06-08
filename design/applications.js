
const reqApplicationDetail = {
    application_id: 3435,
    user_id: 1234
  }
  
const getApplicationDetail = {
code: 200,
message: "success",
data: { 
    // 刷新申请状态和 获取申请数据一致
    application_id: 3435,
    user_id: 1234,
    created_datetime: "2023-05-15",
    status: 2, // 0 is not finished, 1 is completed, 2 is in progress, 3 is rejected
    file_data: [
        {
        file_id: 3,
        file_name: "申請書.pdf",
        file_info: {
            file_url: "https:\\www.xxx.com/fesp89s31.pdf",
            file_size: 1024,
            // ... other info
        },
        file_output: [
            // todo out put csv data... 
            
        ],
        },
        {
        // file 2 ...
        }
    ],
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
    }
}
