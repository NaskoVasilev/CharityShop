setTimeout(function(){
    let elements = document.getElementsByClassName('like');

    for (const element of elements) {
        element.addEventListener('click', likePostEvent)
    }
},100);

async function likePostEvent (event) {
    let target = event.target;
    if(target.nodeName === "I"){
        target = target.parentElement;
    }
    let id = target.dataset.post;
    console.log(id)
    request.get('/blog/post/like/' + id)

    let index = target.dataset.index
    let span = document.getElementById('likesCount-' + index);
    let value = Number(span.innerHTML);
    span.innerHTML = (value + 1).toString();

    $(`#like-${index}`).css("display", "none");
    $(`#dislike-${index}`).css("display", "inline");
}

setTimeout(function(){
    let elements = document.getElementsByClassName('dislike');

    for (const element of elements) {
        element.addEventListener('click', dislikePostEvent)
    }
},100);

async function dislikePostEvent () {
    let target = event.target;
    if(target.nodeName === "I"){
        target = target.parentElement;
    }
    let id = target.dataset.post;
    console.log(id)
    request.get('/blog/post/dislike/' + id)

    let index = target.dataset.index
    let span = document.getElementById('likesCount-' + index);
    let value = Number(span.innerHTML);
    span.innerHTML = (value - 1).toString();

    $(`#like-${index}`).css("display", "inline");
    $(`#dislike-${index}`).css("display", "none");
}

setTimeout(function(){
    let elements = document.getElementsByClassName('remove-comment');
    for (const element of elements) {
        element.addEventListener('click', removeComment)
    }
},100);

async function removeComment(event){
    let target = event.target;
    if(target.nodeName === "I"){
        target = target.parentElement;
    }
    let id = target.dataset.id;
    let postId = document.getElementById('postId').value;
    $(target.parentElement).hide();
    await request.get('/blog/post/' + postId + '/comment/remove/' + id)
}