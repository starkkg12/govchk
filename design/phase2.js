
const reqService = {
    service_id: 32436,
    user_id: 43455
}

const resService = {
    code: 200,
    message : "success",
    data: {
        service_id: 32436,
        status: 1, // 0 is not public, 1 is completed
        service_title: "申請MyNumberCard",
        service_desc: "MyNumberCard <br> 申請書を提出してください",
        need_OCR: true,
        need_system: true,
        status: 2, // 0  1, // 2
        trigger_type: 0, // 0 is automatic, 1 is all of the conditions are met
        web_upload: true, 
        enforce_OCR: false,
        field_data: [
            {
                field_id: 131245,
                order_no: 1,
                service_name: "申請人名",
                created_time: "2021-01-01 12:00:00"
            },
            {
                // field 2 ...
            }
        ],
        condition_data: [
            {
                condition_id: 1,
                order_no: 1,
                default_status: true,
                is_required: true,
                condition_name: "申請日",
                condition_desc: "..............................."
            },
            {
                // condition 2 ...
            }
        ],
        file_limit_data: [
            {
                file_limit_id: 34242,
                order_no: 1,
                file_name: "申請書",
                file_desc: "...",
                check_rule: "pdf"
            },
            {
                // file 2 ...
            }
        ]
    }
}


const reqServiceInfo = { 
        service_id: 32436,
        status: 1, // 0 is not public, 1 is completed
        service_title: "申請MyNumberCard",
        service_desc: "MyNumberCard <br> 申請書を提出してください",
        need_OCR: true,
        need_system: true,
        status: 2, // 0  1, // 2
        trigger_type: 0, // 0 is automatic, 1 is all of the conditions are met
        web_upload: true, 
        enforce_OCR: false,  
}

const resServiceInfo = {
    code: 200,
    message : "success"
}