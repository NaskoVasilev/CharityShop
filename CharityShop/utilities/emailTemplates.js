function getEventEmail(data){
    let getEventEmail =
        `<div>
            <h3>${data.title}</h3>
            <p>${data.content}</p>
            <p>Събитието ще се проведе в ${data.address}, ${data.town}</p>
            <p>Описание:  ${data.description}</p>
            <span>Дата: ${data.date.getDay()}.${data.date.getMonth()}.${data.date.getFullYear()}</span>
            <p>
                <a href="${data.eventDetailsUrl}">Детайли за предстоящото събитие!</a>
            </p>
        </div>`

    return getEventEmail;
}

module.exports = {
    getEventEmail: getEventEmail,
}