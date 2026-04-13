let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

document.addEventListener("DOMContentLoaded", function () {

    // VIEWS
    let viewsElement = document.getElementById("viewsCount");
    let storyId = window.location.pathname;  // Unique for every page
    let views = parseInt(localStorage.getItem("views_" + storyId) || viewsElement.innerText);
    views++;
    viewsElement.innerText = views;
    localStorage.setItem("views_" + storyId, views);

    // LIKES
    let likeButton = document.getElementById("likeIcon");
    let likeElement = document.getElementById("likeCount");

    if (localStorage.getItem("liked_" + storyId) === "true") {
        likeButton.style.opacity = "0.5";
    }

    likeButton.addEventListener("click", function () {
        if (!isLoggedIn) {
            alert("⚠️ You must log in to like this story.");
            return;
        }

        let currentLikes = parseInt(likeElement.innerText);

        if (localStorage.getItem("liked_" + storyId) === "true") {
            likeElement.innerText = currentLikes - 1;
            localStorage.removeItem("liked_" + storyId);
            likeButton.style.opacity = "1";
        } else {
            likeElement.innerText = currentLikes + 1;
            localStorage.setItem("liked_" + storyId, "true");
            likeButton.style.opacity = "0.5";
        }
    });

    // LOAD COMMENTS
    loadComments(storyId);

    // FOLLOW BUTTON
    let followButton = document.getElementById("followButton");

    if (followButton) {
        if (localStorage.getItem("followed_" + storyId) === "true") {
            followButton.innerText = "✔️ Following";
            followButton.style.opacity = "0.5";
        }

        followButton.addEventListener("click", function () {
            if (!isLoggedIn) {
                alert("⚠️ You must log in to follow the writer.");
                return;
            }

            if (localStorage.getItem("followed_" + storyId) === "true") {
                localStorage.removeItem("followed_" + storyId);
                followButton.innerText = "➕ Follow";
                followButton.style.opacity = "1";
            } else {
                localStorage.setItem("followed_" + storyId, "true");
                followButton.innerText = "✔️ Following";
                followButton.style.opacity = "0.5";
            }
        });
    }

});

// SHARE BUTTON
function sharePage() {
    navigator.clipboard.writeText(window.location.href)
        .then(() => alert("Link copied!"))
        .catch(() => alert("Failed to copy link."));
}

// COMMENTS FUNCTIONS
function addComment() {
    if (!isLoggedIn) {
        alert("⚠️ You must log in to write a comment.");
        return;
    }

    let commentInput = document.getElementById("commentInput");
    let commentText = commentInput.value.trim();

    if (commentText === "") {
        alert("Comment cannot be empty!");
        return;
    }

    let commentsList = document.getElementById("commentsList");
    let commentDiv = document.createElement("div");
    commentDiv.className = "comment";
    commentDiv.innerHTML = commentText;
    commentsList.appendChild(commentDiv);

    // إضافة زر الحذف إذا كان المستخدم "admin"
    addDeleteButtonToComment(commentDiv);

    let storyId = window.location.pathname;
    saveComment(commentText, storyId);

    commentInput.value = "";
}

function saveComment(comment, storyId) {
    let comments = JSON.parse(localStorage.getItem("comments_" + storyId) || "[]");
    comments.push(comment);
    localStorage.setItem("comments_" + storyId, JSON.stringify(comments));
}

function loadComments(storyId) {
    let comments = JSON.parse(localStorage.getItem("comments_" + storyId) || "[]");
    let commentsList = document.getElementById("commentsList");

    commentsList.innerHTML = "";  // This is the line I added ✅

    comments.forEach(function (comment) {
        let commentDiv = document.createElement("div");
        commentDiv.className = "comment";
        commentDiv.innerHTML = comment;
        commentsList.appendChild(commentDiv);

        // إضافة زر الحذف إذا كان المستخدم "admin"
        addDeleteButtonToComment(commentDiv);
    })
}

// إضافة زر حذف لكل تعليق جديد
function addDeleteButtonToComment(commentDiv) {
    if (localStorage.getItem("userRole") === "admin") {
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.innerText = "Delete";
        deleteButton.onclick = function () {
            deleteComment(deleteButton);
        };
        commentDiv.appendChild(deleteButton);
}}

// حذف التعليق
function deleteComment(button) {
    const comment = button.parentElement;
    comment.remove();
}
