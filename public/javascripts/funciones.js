var socket = io.connect('http://localhost:4000');

$(document).ready(function()
{
    manageSessions.unset("login");
});


function animateScroll()
{
    var container = $('#containerMessages');
    container.animate({"scrollTop": $('#containerMessages')[0].scrollHeight}, "slow");
}


$(function()
{
    animateScroll();
    showModal("Ingresa al Chat",renderForm());
    $("#containerSendMessages, #containerSendMessages input").on("focus click", function(e)
    {
        e.preventDefault();
        if(!manageSessions.get("login"))
        {
            showModal("Inicia sesión",renderForm(), false);
        }
    });

    $("#loginBtn").on("click", function(e)
    {
        e.preventDefault();
        if($(".username").val().length < 2)
        {
            $(".errorMsg").hide();
            $(".username").after("<div class='col-md-12 alert alert-danger errorMsg'>Debes introducir tu Nombre.</div>").focus(); 
            return;
        }
        manageSessions.set("login", $(".username").val());
        socket.emit("loginUser", manageSessions.get("login"));
        $("#formModal").modal("hide");
        animateScroll();
    });

    socket.on("userInUse", function()
    {
        $("#formModal").modal("show");
        manageSessions.unset("login");
        $(".errorMsg").hide();
        $(".username").after("<div class='col-md-12 alert alert-danger errorMsg'>El usuario que intenta escoge está en uso.</div>").focus();
        return; 
    });


    socket.on("refreshChat", function(action, message)
    {

        if(action == "conectado")
        {
            $("#chatMsgs").append("<p class=' itemListChat alert-info'>" + message + "</p>");
        }
        else if(action == "desconectado")
        {
            $("#chatMsgs").append("<p class='itemListChatDesc alert-danger'>" + message + "</p>");
        }
        else if(action == "msg")
        {
            $("#chatMsgs").append("<p class='itemListChatUser '>" + message + "</p>");
        }
        else if(action == "yo")
        {
            $("#chatMsgs").append("<p class='itemListChatYo alert-success'>" + message + "</p>");
        }
        animateScroll();
    });

    socket.on("updateSidebarUsers", function(usersOnline)
    {
        $("#chatUsers").html("");
        if(!isEmptyObject(usersOnline))
        {
            $.each(usersOnline, function(key, val)
            {
                $("#chatUsers").append("<p class='col-md-12 item-usuario'>" + key + "</p>");
            })
        }
    });


    $('.sendMsg').on("click", function() 
    {
        var message = $(".message").val();
        if(message.length > 2)
        {
            socket.emit("addNewMessage", message);
            //limpiamos el mensaje
            $(".message").val("");
        }
        else
        {
            showModal("Error formulario","<p class='alert alert-danger'>Debe escribir su menssage.</p>", "true");
        }
        animateScroll();
    });

});

function showModal(title,message,showClose)
{
    console.log(showClose)
    $("h2.title-modal").text(title).css({"text-align":"center"});
    $("p.formModal").html(message);
    if(showClose == "true")
    {
        $(".modal-footer").html('<a data-dismiss="modal" aria-hidden="true" class="btn btn-danger">Cerrar</a>');
        $("#formModal").modal({show:true});
    }
    else
    {
        $("#formModal").modal({show:true, backdrop: 'static', keyboard: true });
    }
}

function renderForm()
{
    var html = "";
    html += '<div class="form-group" id="formLogin">';
    html += '<input type="text" id="username" class="form-control username" placeholder="Ingresa tu nombre de usuario">';
    html += '</div>';
    html += '<button type="submit" class="btn btn-entrar btn-large" id="loginBtn">Ingresar</button>';
    return html;
}

var manageSessions = {
    get: function(key) {
        return sessionStorage.getItem(key);
    },
    set: function(key, val) {
        return sessionStorage.setItem(key, val);
    },
    unset: function(key) {
        return sessionStorage.removeItem(key);
    }
};

function isEmptyObject(obj) 
{
    var name;
    for (name in obj) 
    {
        return false;
    }
    return true;
}
