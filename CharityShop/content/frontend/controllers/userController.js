(() => {
    setTimeout(function () {
        let verifyButton = document.getElementById('verify');
        verifyButton.addEventListener('click', sendVerificationEmail)
    }, 100)

    function sendVerificationEmail() {
        let codeInput = $('input[name=generatedCode]')

        let email = $('input[type=email][name=email]').val()
        let data = {
            email
        }
        request.post('/user/send/verification/email', data)
            .then(json => {
                if(json !== 'Error'){
                    codeInput.val(json)
                }
            })
    }
})()