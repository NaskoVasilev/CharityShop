function  checkPostIsLiked(req, post) {
    if(req.user && post.likes
        .map(l => l.toString())
        .includes(req.user._id.toString())){
        post.isLiked = true;
    }
    else{
        post.isLiked = false;
    }
}

function normalizePosts(req, posts){
    for (const post of posts) {
        post.date = post.creationDate.toDateString();
        post.creator = post.author.firstName + ' ' + post.author.lastName;
        post.content = post.content.substr(0, 100) + '...';
        post.likesCount = post.likes.length || 0;
        checkPostIsLiked(req,post);
    }
}

module.exports ={
    normalizePosts: normalizePosts,
    checkPostIsLiked: checkPostIsLiked
}