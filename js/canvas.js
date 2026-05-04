const canvas = new fabric.Canvas('artboard', { preserveObjectStacking: true, backgroundColor: '#000000' });

function loadCanvasAsset(type) {
    appState.currentCanvasType = type;
    if(appState.generatedAssets[type]) {
        canvas.loadFromJSON(appState.generatedAssets[type], () => {
            canvas.renderAll();
            fitArtboard();
            updateLayerList();
            showToast(`Loaded ${type.toUpperCase()} canvas for editing.`);
        });
    } else {
        showToast("Asset not generated yet.", true);
    }
}

function addText() {
    let t = new fabric.Textbox("NEW TEXT", { left: 100, top: 100, width: 600, fontSize: 80, fontFamily: 'Anton', fill: '#ffffff', stroke: 'transparent', strokeWidth: 0 });
    canvas.add(t); canvas.setActiveObject(t); updateLayerList();
}
function addCard() {
    let c = new fabric.Rect({ width: 600, height: 200, fill: 'rgba(15,17,26,0.85)', rx: 20, ry: 20, left: 100, top: 100 });
    canvas.add(c); canvas.setActiveObject(c); updateLayerList();
}
function setBgImage(url) {
    fabric.Image.fromURL(url, function(img) {
        let scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        img.set({ scaleX: scale, scaleY: scale, originX: 'center', originY: 'center', left: canvas.width/2, top: canvas.height/2, isBg: true });
        
        // remove old bg
        canvas.getObjects().forEach(o => { if(o.isBg) canvas.remove(o); });
        canvas.insertAt(img, 0);
        updateLayerList();
    }, { crossOrigin: 'anonymous' });
}

// PROPERTIES PANEL UPDATES
canvas.on('selection:created', updateProps);
canvas.on('selection:updated', updateProps);
canvas.on('selection:cleared', () => {
    document.getElementById('dynamic-properties').innerHTML = `<div class="empty-state"><i class="fas fa-mouse-pointer"></i><br>Select an element to edit.</div>`;
    updateLayerList();
});

function updateProps() {
    let obj = canvas.getActiveObject();
    if(!obj) return;
    let isText = obj.type === 'textbox' || obj.type === 'i-text';
    
    let html = `
        <div class="section" style="padding-top:0;">
            <div class="row" style="margin-bottom:15px;">
                <button class="btn" style="flex:1; justify-content:center;" onclick="canvas.bringForward(canvas.getActiveObject()); updateLayerList();"><i class="fas fa-arrow-up"></i></button>
                <button class="btn" style="flex:1; justify-content:center;" onclick="canvas.sendBackwards(canvas.getActiveObject()); updateLayerList();"><i class="fas fa-arrow-down"></i></button>
                <button class="btn" style="flex:1; justify-content:center; color: var(--danger);" onclick="canvas.remove(canvas.getActiveObject()); canvas.discardActiveObject(); updateLayerList();"><i class="fas fa-trash"></i></button>
            </div>
    `;

    if(isText) {
        html += `
            <div class="input-group">
                <label>Text Content</label>
                <textarea oninput="canvas.getActiveObject().set('text', this.value); canvas.renderAll();">${obj.text}</textarea>
            </div>
            <div class="row">
                <div class="input-group"><label>Font Size</label><input type="number" value="${obj.fontSize}" oninput="canvas.getActiveObject().set('fontSize', parseInt(this.value)); canvas.renderAll();"></div>
                <div class="input-group"><label>Font Family</label><select onchange="canvas.getActiveObject().set('fontFamily', this.value); canvas.renderAll();">
                    <option value="Anton" ${obj.fontFamily==='Anton'?'selected':''}>Anton</option>
                    <option value="Montserrat" ${obj.fontFamily==='Montserrat'?'selected':''}>Montserrat</option>
                    <option value="Oswald" ${obj.fontFamily==='Oswald'?'selected':''}>Oswald</option>
                    <option value="Playfair Display" ${obj.fontFamily==='Playfair Display'?'selected':''}>Playfair</option>
                </select></div>
            </div>
            <div class="row">
                <div class="input-group"><label>Color</label><input type="color" value="${obj.fill}" oninput="canvas.getActiveObject().set('fill', this.value); canvas.renderAll();"></div>
                <div class="input-group"><label>Line Height</label><input type="number" step="0.1" value="${obj.lineHeight}" oninput="canvas.getActiveObject().set('lineHeight', parseFloat(this.value)); canvas.renderAll();"></div>
            </div>
            <div class="row" style="border-top:1px solid var(--border); padding-top:10px; margin-top:10px;">
                <div class="input-group"><label>Stroke Width</label><input type="number" value="${obj.strokeWidth || 0}" oninput="canvas.getActiveObject().set('strokeWidth', parseInt(this.value)); canvas.renderAll();"></div>
                <div class="input-group"><label>Stroke Color</label><input type="color" value="${obj.stroke || '#000000'}" oninput="canvas.getActiveObject().set('stroke', this.value); canvas.renderAll();"></div>
            </div>
        `;
    }

    html += `
        <div class="row" style="border-top:1px solid var(--border); padding-top:10px; margin-top:10px;">
            <div class="input-group"><label>Opacity</label><input type="number" step="0.1" min="0" max="1" value="${obj.opacity}" oninput="canvas.getActiveObject().set('opacity', parseFloat(this.value)); canvas.renderAll();"></div>
            ${obj.type === 'rect' ? `<div class="input-group"><label>Border Radius</label><input type="number" value="${obj.rx}" oninput="canvas.getActiveObject().set({rx: parseInt(this.value), ry: parseInt(this.value)}); canvas.renderAll();"></div>` : ''}
        </div></div>`;

    document.getElementById('dynamic-properties').innerHTML = html;
    updateLayerList();
}

function updateLayerList() {
    const list = document.getElementById('layer-list');
    let html = '';
    let objs = canvas.getObjects();
    for(let i = objs.length - 1; i >= 0; i--) {
        let isAct = canvas.getActiveObject() === objs[i] ? 'active' : '';
        let name = objs[i].type === 'textbox' ? 'Text Layer' : (objs[i].isBg ? 'Background' : 'Shape/Image');
        html += `<div class="layer-item ${isAct}" onclick="canvas.setActiveObject(canvas.getObjects()[${i}]); canvas.renderAll();">${name}</div>`;
    }
    list.innerHTML = html;
}

async function downloadCurrentCanvas() {
    canvas.discardActiveObject(); canvas.renderAll();
    const dataUrl = canvas.toDataURL({ format: 'png', quality: 1 });
    let link = document.createElement('a');
    link.download = `QuickFare_${appState.currentCanvasType}.png`; link.href = dataUrl; link.click();
}

function fitArtboard() {
    const wrapper = document.getElementById('artboard-wrapper');
    const ws = document.querySelector('.workspace');
    const scale = Math.min((ws.clientWidth - 40) / canvas.width, (ws.clientHeight - 100) / canvas.height);
    wrapper.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', fitArtboard);
setTimeout(fitArtboard, 100);
