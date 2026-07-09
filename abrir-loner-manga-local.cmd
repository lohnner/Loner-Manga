@echo off
cd /d "%~dp0"
echo Abrindo Loner Manga em http://localhost:8766/index.html
echo Nao feche esta janela enquanto estiver usando login do Firebase.
start "" "http://localhost:8766/index.html"
python -m http.server 8766 --bind localhost
pause
