var canvas = document.getElementById("paint");
var fileInput = document.getElementById("file-input");
var uploadButton = document.getElementById("upload-button");
var saveButton = document.getElementById("save-button");
var ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;
id_cross_line=-1;

var background = new Image();

// add an event listener to the button
uploadButton.addEventListener("click", function() {
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(event) {
    background.onload = function(){
        ctx.drawImage(background,0, 0,background.width,background.height,0,0,width,height);   
        img = ctx.getImageData(0, 0, width, height);
    }
    background.src = event.target.result;
    }
  });


// add an event listener to the button
saveButton.addEventListener("click", function() {
    var filename = "configuration.txt";
    var data = JSON.stringify(canvas_data);
    $.post("/", { save_fname: filename, save_cdata: data});
    alert(filename + " saved");
  });



var curX, curY, prevX, prevY;
var hold = false;
ctx.lineWidth = 2;
var fill_value = true;
var stroke_value = false;
var canvas_data = {"line": []}
                        
function color(color_value){
    ctx.strokeStyle = color_value;
    ctx.fillStyle = color_value;
}    
           
function createEntryLine(){
    line("Entry");
}

function createExitLine(){
    line("Exit");
}
               
function reset(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background,0, 0,background.width,background.height,0,0,width,height);    
    canvas_data = {"line": []}
}
        
    
// line tool

function draw_line_direction(ctx,img,x1,y1,x2,y2,x3,y3){
    ctx.beginPath();
    ctx.fillStyle = "cyan";
    let radius=10;
    ctx.moveTo(x1, y1);
    ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
    ctx.moveTo(x2, y2);
    ctx.arc(x2, y2, radius, 0, 2 * Math.PI);
    ctx.moveTo(x3, y3);
    ctx.arc(x3, y3, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
    draw_arrow(ctx, x2,y2, x3, y3, 0.9);
}
        
function calc_dist(point1,point2){
    x1=point1[0]
    y1=point1[1]
    x2=point2[0]
    y2=point2[1]
    let dist= Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return dist;
}

function line(line_type){
    id_cross_line=id_cross_line+1
    x1=200;
    y1=200;
    x2=300;
    y2=300;
    x3=250;
    y3=350;
    //img = ctx.getImageData(0, 0, width, height);
    ctx.putImageData(img, 0, 0);
    canvas_data.line.push({"points":[[x1,y1],[x2,y2],[x3,y3]],"id":id_cross_line,"line_type":line_type });
    for(let i=0; i<canvas_data.line.length; i++){
        let cur_pts=canvas_data.line[i].points;
        draw_line_direction(ctx,img,cur_pts[0][0],cur_pts[0][1],cur_pts[1][0],cur_pts[1][1],cur_pts[2][0],cur_pts[2][1]);
    } 

           
    canvas.onmousedown = function (e){
        hold=false;
        prevX = e.clientX - canvas.offsetLeft;
        prevY = e.clientY - canvas.offsetTop;
        selected_cross_line_id=-1
        selected_point_id=0;
        min_dist=100000;
        for(let i=0; i<canvas_data.line.length; i++){
            let cur_cross_line=canvas_data.line[i];
            cur_min_dist=100000;
            cur_point_id=0;
            for (let j=0;j<3;j++){
                let cur_dist=calc_dist([prevX,prevY],cur_cross_line.points[j]);
                if(cur_dist<cur_min_dist){
                    cur_min_dist=cur_dist;
                    cur_point_id=j;
                }
            }
            if(cur_min_dist<min_dist){
                min_dist=cur_min_dist;
                selected_cross_line_id=cur_cross_line.id;
                selected_point_id=cur_point_id;
            }
          }
        if(min_dist<20){
            hold=true;
        }
    };
            
    canvas.onmousemove = function linemove(e){
        if (hold){
            curX = e.clientX - canvas.offsetLeft;
            curY = e.clientY - canvas.offsetTop;
            for(let i=0; i<canvas_data.line.length; i++){
                if(canvas_data.line[i].id==selected_cross_line_id){
                    canvas_data.line[i].points[selected_point_id]=[curX,curY];
                }
            }
            ctx.putImageData(img, 0, 0);
            for(let i=0; i<canvas_data.line.length; i++){
                let cur_pts=canvas_data.line[i].points;
                draw_line_direction(ctx,img,cur_pts[0][0],cur_pts[0][1],cur_pts[1][0],cur_pts[1][1],cur_pts[2][0],cur_pts[2][1]);
            } 
        }
    };
            
    canvas.onmouseup = function (e){
         hold = false;
    };
            
    canvas.onmouseout = function (e){
         hold = false;
    };
}



function draw_arrow(context, x1, y1, x2, y2, t = 0.9){
    const arrow = {
        dx: x2 - x1,
        dy: y2 - y1
    };
  	const middle = {
        x: arrow.dx * t + x1,
        y: arrow.dy * t + y1
    };
    const tip = {
        dx: x2 - middle.x,
        dy: y2 - middle.y
    };
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(middle.x, middle.y);
  	context.moveTo(middle.x + 0.5 * tip.dy, middle.y - 0.5 * tip.dx);
    context.lineTo(middle.x - 0.5 * tip.dy, middle.y + 0.5 * tip.dx);
    context.lineTo(x2, y2);
    context.closePath();
    context.stroke();
}

