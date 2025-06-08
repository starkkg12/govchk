import { LIMIT_MULTI } from '@/utils/const'

const fileLimitOrder = ['PDF', 'PNG', 'TIFF', 'TIF', 'JPG', 'JPEG'];

const convertFileLimitToFileCondition = (fileLimit) => {

    let fileCondition = ''
    if (fileLimit.fileType) {
        fileLimit.fileType.sort((a, b) => {
            return fileLimitOrder.indexOf(a) - fileLimitOrder.indexOf(b);
        });
        const newArray = fileLimit.fileType.map(e => '*.' + e);
        let str = newArray.join() + ";"

        fileCondition = fileCondition + str
    }
    if (fileLimit.fileSize) {
        fileCondition = fileCondition + "<" + fileLimit.fileSize + "MB;"
    }
    if (fileLimit.multi === LIMIT_MULTI.YES || fileLimit.multi === true) {
        fileCondition = fileCondition + "複数可;"
    }

    return fileCondition
}

const convertFileLimitToForm = (fileLimit) => {

    const formLimit = {}
    formLimit.id=fileLimit.id
    formLimit.fileName = fileLimit.fileName
    formLimit.multi = fileLimit.multi === LIMIT_MULTI.YES
    formLimit.fileSize = fileLimit.fileSize
    if (fileLimit.fileType) {
        const fileTypes = fileLimit.fileType.split(",");
        formLimit.fileType = fileTypes
    }

    formLimit.description = fileLimit.description

    return formLimit
}

const convertLimitToFileCondition = (fileLimit) => {
    let fileCondition = ''
    if (fileLimit.fileType) {
        const fileTypes = fileLimit.fileType.split(",");
        fileTypes.sort((a, b) => {
            return fileLimitOrder.indexOf(a) - fileLimitOrder.indexOf(b);
        });
        const newArray = fileTypes.map(e => '*.' + e);
        fileCondition = newArray.join() + ";"
    }
    if (fileLimit.fileSize) {
        fileCondition = fileCondition + "<" + fileLimit.fileSize + "MB;"
    }

    if (fileLimit.multi === LIMIT_MULTI.YES || fileLimit.multi === true) {
        fileCondition = fileCondition + "複数可;"
    }

    return fileCondition
}

export { convertFileLimitToFileCondition, convertFileLimitToForm, convertLimitToFileCondition }