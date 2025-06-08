export default {
    mounted(el) {
        el.addEventListener('keydown', (event) => {
            const keyCode = event.keyCode;
            const target = event.target;

            const isTextInput = target.tagName.toLowerCase() === 'input' || target.classList.contains('el-input__inner');

            if (keyCode === 38 || keyCode === 40) {
                const inputs = [...el.querySelectorAll('input, .el-input__inner, .el-date-editor, .el-input__suffix')];
                const currentIndex = inputs.indexOf(target);

                let nextIndex;
                if (keyCode === 38) { // 上
                    nextIndex = currentIndex - 1;
                } else if (keyCode === 40) { // 下
                    nextIndex = currentIndex + 1;
                }

                if (nextIndex !== undefined && nextIndex >= 0 && nextIndex < inputs.length) {
                    inputs[nextIndex].focus();
                    event.preventDefault();
                }
            }

            if (!isTextInput) {
                let nextIndex;
                const inputs = [...el.querySelectorAll('input, .el-input__inner, .el-date-editor, .el-input__suffix')];
                const currentIndex = inputs.indexOf(target);

                if (keyCode === 37) { // 左
                    nextIndex = currentIndex - 1;
                } else if (keyCode === 39) { // 右
                    nextIndex = currentIndex + 1;
                }

                if (nextIndex !== undefined && nextIndex >= 0 && nextIndex < inputs.length) {
                    inputs[nextIndex].focus();
                    event.preventDefault();
                }
            }
        });
    }
};
