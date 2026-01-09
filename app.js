// ملف: app.js
const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');

const PORT = 3000;
const DATA_FILE = 'messages.json';

// إنشاء ملف JSON إذا لم يكن موجود
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'GET') {
        const messages = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const messagesList = messages
            .map(m => `<li><span class="time">[${m.time}]</span> <strong>${m.name}:</strong> ${m.text}</li>`)
            .join('');

        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(`
            <!DOCTYPE html>
            <html lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>Home</title>
                <style>
                    body {
                        
                        font-family: Arial, sans-serif;
                        background: linear-gradient(135deg, #6b73ff, #000dff);
                        color: #fff;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 30px;
                    }
                    h1 { margin-bottom: 20px; }
                    form {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        background: rgba(0,0,0,0.75);
                        padding: 20px;
                        border-radius: 10px;
                        width: 300px;
                    }
                    input {
                        padding: 10px;
                        border-radius: 5px;
                        border: none;
                        font-size: 14px;
                    }
                    button {
                        padding: 10px;
                        border-radius: 5px;
                        border: none;
                        background-color: #ff8c00;
                        color: #fff;
                        font-weight: bold;
                        cursor: pointer;
                        transition: 0.3s;
                    }
                    button:hover { background-color: #ffa500; }
                    ul {
                        
                        list-style: none;
                        padding: 0;
                        margin-top: 30px;
                        width: 400px;
                    }
                    li {
                        background: rgba(0,0,0,0.3);
                        margin-bottom: 10px;
                        padding: 10px;
                        border-radius: 5px;
                    }
                    .time { color: #ccc; font-size: 12px; margin-right: 5px; }
                </style>
            </head>
            <body>
            <div style="position:sticky;top: 0;">
                    <h1 style="text-align: center;">Home page</h1>
                <form method="POST">
                    <input type="text" name="name" placeholder="your name..." required>
                    <input type="text" name="message" placeholder="enter you message..." required>
                    <button type="submit">post</button>
                </form>
                </div>
                <ul>${messagesList}</ul>
                <script>
function fetchMessages() {
    fetch('/')
    .then(res => res.text())
    .then(ul => {
        // إنشاء عنصر مؤقت لعرض HTML كامل الصفحة
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = ul;
        
        // نسخ الرسائل من الصفحة الجديدة إلى القائمة الحالية
        const newMessages = tempDiv.querySelector('ul').innerHTML;
        document.querySelector('ul').innerHTML = newMessages;
    })
    .catch(err => console.error(err));
}

// تحديث الرسائل كل 2 ثانية
setInterval(fetchMessages, 2000);
</script>

            </body>
            </html>
        `);
    } 
    else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const parsedBody = qs.parse(body);
            const name = parsedBody.name.trim();
            const text = parsedBody.message.trim();

            if (name && text) {
                const messages = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
                const time = new Date().toLocaleString();
                messages.push({ name, text, time });
                fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));

                res.writeHead(302, { Location: '/' });
                res.end();
            } else {
                res.writeHead(400);
                res.end('الاسم أو الرسالة فارغة!');
            }
        });
    } else {
        res.writeHead(405);
        res.end('Method Not Allowed');
    }
});

server.listen(PORT, () => {
    console.log(`✅http://localhost:${PORT}`);
});
