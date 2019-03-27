$(()=>{
    $('#messageBox').on('click', function () {
        $('#messageBox').fadeOut()
    })

    setTimeout(function () {
        $('#messageBox').fadeOut()
    }, 3000)

    $('#errorBox').on('click', function () {
        $('#errorBox').fadeOut()
    })

    setTimeout(function () {
        $('#errorBox').fadeOut()
    }, 3000)
})()