function getEventEmail(data){
    let getEventEmail =
        `<div>
            <h3>${data.title}</h3>
            <p>${data.content}</p>
            <p>Събитието ще се проведе в ${data.address}, ${data.town}</p>
            <p>Описание:  ${data.description}</p>
            <span>Дата: ${data.date.toLocaleDateString("en-US")}</span>
            <p>
                <a href="${data.eventDetailsUrl}">Детайли за предстоящото събитие!</a>
            </p>
        </div>`

    return getEventEmail;
}

function getVerificationEmail(code){
    let email =
        `<div>
            <p>Здравей,</p>
            <p>Вашият код за потвърждаване на емейл адреса ви е : ${code}</p>
            <p>Моля въведете този код във формата за регистрация!</p>
        </div>`

    return email;
}

module.exports = {
    getEventEmail: getEventEmail,
    getVerificationEmail: getVerificationEmail
}