#!/bin/sh

# Cloning from github is not practical since it has a lot of useless symbols
# echo 'Cloning kicad-symbols from github'
# git clone --depth 1 --single-branch https://github.com/KiCad/kicad-symbols

for i in kicad-symbols/*.lib; do
    [ -f "$i" ] || break
    echo 'Processing': $i;
    python libAPI/helper/main.py $i symbol_svgs
done
