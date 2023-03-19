import os
import sys
import json
from flask import Flask, render_template, request, redirect, url_for
import psycopg2


app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
def paintapp():
    if request.method == 'GET':
        return render_template("paint.html")
    if request.method == 'POST':
        filename = request.form['save_fname']
        data = request.form['save_cdata']
        data=json.loads(str(data))
        file_lines=""
        for i in range(len(data["line"])):
            cur_data=data["line"][i]
            line_type=cur_data["line_type"]
            points=cur_data["points"]
            cur_info="line-crossing-"+line_type+"="
            cur_info=cur_info+str(points[1][0])+';'
            cur_info=cur_info+str(points[1][1])+';'
            cur_info=cur_info+str(points[2][0])+';'
            cur_info=cur_info+str(points[2][1])+';'
            cur_info=cur_info+str(points[0][0])+';'
            cur_info=cur_info+str(points[0][1])+';'
            cur_info=cur_info+str(points[1][0])+';'
            cur_info=cur_info+str(points[1][1])+'\n'
            file_lines=file_lines+cur_info

        with open(filename, 'w') as f:
            f.write(file_lines)
            
        return render_template("paint.html")        
        
        
@app.route('/save', methods=['GET', 'POST'])
def save():
    conn = psycopg2.connect(database="paintmyown", user="nidhin")
    cur = conn.cursor()
    cur.execute("SELECT id, name, data, canvas_image from files")
    files = cur.fetchall()
    conn.close()
    return render_template("save.html", files = files )
    
@app.route('/search', methods=['GET', 'POST'])
def search():
    if request.method == 'GET':
        return render_template("search.html")
    if request.method == 'POST':
        filename = request.form['fname']
        conn = psycopg2.connect(database="paintmyown", user="nidhin")
        cur = conn.cursor()
        cur.execute("select id, name, data, canvas_image from files")
        files = cur.fetchall()
        conn.close()
        return render_template("search.html", files=files, filename=filename)
    
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
