
let width = 0;
let height = 0;
let colors = [{ r: 236, g: 203, b: 107, a: 1 },
{ r: 4, g: 168, b: 154, a: 1 },
{ r: 214, g: 156, b: 78, a: 1 },
{ r: 11, g: 119, b: 94, a: 1 },
{ r: 53, g: 72, b: 35 },
{ r: 255, g: 255, b: 255, a: 1 }];

function color(col) {
    return "rgb(" + col.r + "," + col.g + "," + col.b + "," + col.a + ")";
}
function lerp(col1, col2, amt) {
    let r = col1.r - col2.r, g = col1.g - col2.g, b = col1.b - col2.b, a = col1.a - col2.a;
    r *= amt;
    b *= amt;
    g *= amt;
    a *= amt

    return { r: r + col2.r, g: g + col2.g, b: b + col2.b, a: a + col2.a };
}

function randElem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}


const setupCanvas = () => {
    console.log(document.documentElement.scrollHeight);

    // set up canvas
    let canvas = document.getElementById("bg");
    let ctx = canvas.getContext('2d');
    canvas.height = 0;

    width = canvas.width = screen.width;
    height = canvas.height = document.documentElement.scrollHeight;

    function toRadians(degrees) {
        return degrees / (180 / Math.PI);
    }
    function toDegrees(radians) {
        return radians * (180 / Math.PI);
    }


    function draw() {

        //TODOS: Make sure background pattern looks good with any height/width
       

        let rMax = (width / 100) * Math.sqrt(2);
        let restore_i = 0;
        ctx.save();

        for (let r = rMax; r > 0; r -= rMax / 80) {
            if(restore_i % 10 == 0) {
                ctx.restore();
                ctx.save();
                restore_i = 0;
            }
            
            let ran_r = randElem([500, 700, 1000, 1500, 2000, 2500]);
            colors = shuffle(colors);

            ctx.translate(width /4, height / 2);
            let rot = randElem([0.5, 1, 1.5, 2, 2.5, 3, 3.5])
            ctx.rotate(rot);
            let angleStep = 0.5;

            let wave_arr = [];
            let wave_arr_num = Math.ceil(Math.random(2, 5));
            for (let i = 0; i < wave_arr_num; i++) {
                let freq = randElem([2, 3, 5, 4, 8]);
                let obj = {
                    freq: freq,
                };
                wave_arr.push(obj);
            }
            for (let angle = 0; angle < 270; angle += angleStep) {
                let rad_angle = toRadians(angle);
                let x = Math.cos(rad_angle) * r * 10;
                let y = Math.sin(rad_angle) * r;

                let v = 1;
                for (let wave of wave_arr) {
                    v *= toDegrees(Math.cos(rad_angle * wave.freq));
                }
                
                // calculate colors
                let n =Math.abs((toRadians(v) + 1) / 2);
                let col1 = colors[0], col2 = colors[1];
                col1.a = 0.3;
                col2.a = 0.3;
                let col = lerp(col1, col2, n);
                
                // orient canvas
                ctx.translate(x / 100, y / 100);
                ctx.rotate(rad_angle);

                //draw each line
                ctx.beginPath();
                let nx = (v * ran_r) / 100;
                ctx.strokeWeight = 15;
                ctx.strokeStyle = color(col);
                ctx.moveTo(nx / 2, 0);
                ctx.lineTo(-nx / 2, 0);
                ctx.stroke();

                // reorient canvas
                ctx.translate(-x / 100, -y / 100);
                ctx.rotate(-rad_angle);
            }
            restore_i++;
        }
    }
    ctx.fillStyle = 'rgb(20, 26, 51)';
    ctx.fillRect(0, 0, width, height);

    draw();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgb(37,25,30, 0.6)';
    ctx.fillRect(0, 0, width, height + 7000);

    return canvas;
}

const moveLetters = () => {
    class Letter {
        constructor(elem, t, deg, x, y) {
            this.t = t;
            this.elem = elem;
            this.deg = deg;
            this.x = x;
            this.y = y;
            this.y_mult = randElem([1.5, 2, 2.5]);
            this.x_mult = randElem([1.5, 2, 2.5]);
            this.rot_mult = randElem([1, 1.5, 2, 2.5]);
            this.bounce_count = -1;
        }
            
        update() {
            this.t++;
            this.deg = Math.cos(this.t / 20) * this.rot_mult;
            this.x = Math.cos(this.t/ 20) * this.x_mult;
            this.y = Math.sin(this.t /20) * this.y_mult;
            this.elem.style.transform = "rotate(" + this.deg + "deg) translate(" + this.x + "px," + this.y + "px) ";
            if (this.elem.matches(':hover')) {
                if (this.bounce_count == -1) {
                    this.bounce_count = 0;
                }
            }
            this.bounce();
        }

        bounce() {
            if (this.bounce_count == -1) {
                return;
            }
            if (this.bounce_count > 17) {
                this.y_mult = this.y_mult - 0.5;
                this.rot_mult += 0.5;
                
                if (this.bounce_count > 34) {
                    this.bounce_count = -1;
                    return;
                }
            }
            else {
                this.y_mult += 0.5;
                this.rot_mult -= 0.5;
            }
            
            

            this.bounce_count++;

        }
    }
    let titles = document.getElementsByClassName('title');

    let letters = [];
    for (let title of titles) {
        let start_t = Math.random(1, 10) * 1000;
        let letter = new Letter(title, start_t, 0, 0, 0);
        letters.push(letter);
        letter.update();
    }

    function update() {
        // bug fix- sometimes webpage content changes scrollHeight after canvas has been setup (not registered as a resize)
        if (document.documentElement.scrollHeight > height) {
            setupCanvas();
        }

        for (let letter of letters) {
            letter.update();
        }
        requestAnimationFrame(update);
    }
    update();
}

addEventListener('resize', (event) => {setupCanvas();});


$(document).ready(() => {
    
    moveLetters();
    setupCanvas(); 
    

});