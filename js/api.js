let pexPage = 1;

async function fetchPexels(loadMore = false) {
    if(loadMore) pexPage++; else pexPage = 1;
    const query = document.getElementById('pexels-search').value || "dark abstract";
    const gallery = document.getElementById('pexels-gallery');
    
    try {
        const res = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=12&page=${pexPage}`, {
            headers: { Authorization: CONFIG.PEXELS_KEY }
        });
        const data = await res.json();
        if(!loadMore) gallery.innerHTML = '';
        
        data.photos.forEach(p => {
            gallery.innerHTML += `
                <div class="img-card">
                    <img src="${p.src.medium}">
                    <div class="img-actions">
                        <button class="btn btn-primary" style="font-size:10px; padding:5px;" onclick="setBgImage('${p.src.large2x}')">Set Background</button>
                    </div>
                </div>`;
        });
    } catch (err) { showToast("Pexels API Error", true); }
}
setTimeout(fetchPexels, 1000);

// ==========================================
// QWEN AI GENERATOR (15-PAGE EBOOK + KIT)
// ==========================================
async function generateFullProduct() {
    const topic = document.getElementById('ai-topic').value;
    if(!topic) return showToast("Enter a topic first!", true);

    updateLoader("QWEN-72B IS WRITING E-BOOK...");
    
    // We request the Book Data (15 pages) AND the Ad Strategy in one strict JSON schema
    const schema = `{
        "pexels_query": "2 word dark visual description",
        "book": {
            "title": "Main Title", "subtitle": "Subtitle",
            "ch1_title": "Chapter 1", "ch1_text": "Paragraph 1",
            "ch2_title": "Chapter 2", "ch2_text": "Paragraph 2",
            "ch3_title": "Chapter 3", "ch3_text": "Paragraph 3",
            "ch4_title": "Chapter 4", "ch4_text": "Paragraph 4",
            "ch5_title": "Roadmap", "ch5_text": "Action plan",
            "outro": "Motivational close"
        },
        "kit": {
            "post_hook": "Short aggressive hook", "post_sub": "Post subtext",
            "reel_hook": "STOP SCROLLING hook", "reel_cta": "Call to action",
            "ad_copy": "Full FB Ad Copy", "script": "Reel Script"
        }
    }`;

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST", headers: { "Authorization": `Bearer ${CONFIG.QWEN_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "qwen/qwen-2.5-72b-instruct", messages:[{ "role": "user", "content": `Write a comprehensive E-Book and Marketing Kit for: "${topic}". Use 'Minglish'. Return ONLY JSON matching this schema: ${schema}` }] })
        });
        
        const data = await res.json();
        const aiData = JSON.parse(data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim());

        // Save Text Assets
        appState.adCopy = aiData.kit.ad_copy;
        appState.script = aiData.kit.script;

        // Populate Strategy Panel
        document.getElementById('strategy-panel').style.display = 'block';
        document.getElementById('ai-results').innerHTML = `
            <h4>FB Ad Copy</h4><p>${aiData.kit.ad_copy}</p>
            <h4>Reel Script</h4><p>${aiData.kit.script}</p>
        `;

        // Fetch Pexels Image for Canvas
        document.getElementById('pexels-search').value = aiData.pexels_query;
        let bgUrl = CONFIG.FALLBACK_BGS[0];
        try {
            const pex = await fetch(`https://api.pexels.com/v1/search?query=${aiData.pexels_query}&per_page=1`, { headers: { Authorization: CONFIG.PEXELS_KEY } });
            const pexD = await pex.json();
            if(pexD.photos.length > 0) bgUrl = pexD.photos[0].src.large2x;
        } catch(e){}

        // BUILD E-BOOK HTML (Rendered in View 1)
        buildEbookHTML(aiData.book, bgUrl);

        // BUILD FABRIC CANVAS ASSETS (Saved in Memory for editing in View 2)
        await buildFabricAssets(aiData, bgUrl);

        hideLoader(); showToast("Product Generated!"); switchTab('ai'); // Go to Ebook view

    } catch(e) { hideLoader(); showToast("AI Generation Failed.", true); console.error(e); }
}

function buildEbookHTML(book, bgUrl) {
    const ebookView = document.getElementById('view-ebook');
    ebookView.innerHTML = `
        <div class="a4-page">
            <img src="${bgUrl}" class="bg-img" style="opacity:0.3;">
            <div class="gradient-overlay"></div>
            <div class="a4-content" style="justify-content:center; align-items:center; text-align:center;">
                <h1 contenteditable="true" style="font-family:'Anton'; font-size:80px; color:var(--accent);">${book.title}</h1>
                <h2 contenteditable="true" style="font-family:'Montserrat'; font-size:24px; color:white;">${book.subtitle}</h2>
            </div>
        </div>
        <div class="a4-page"><div class="a4-content"><h2 contenteditable="true" style="color:var(--accent); font-family:'Anton'; font-size:50px;">${book.ch1_title}</h2><p contenteditable="true" style="font-size:18px; line-height:1.8;">${book.ch1_text}</p></div></div>
        <div class="a4-page"><div class="a4-content"><h2 contenteditable="true" style="color:var(--accent); font-family:'Anton'; font-size:50px;">${book.ch2_title}</h2><p contenteditable="true" style="font-size:18px; line-height:1.8;">${book.ch2_text}</p></div></div>
        <div class="a4-page"><div class="a4-content"><h2 contenteditable="true" style="color:var(--accent); font-family:'Anton'; font-size:50px;">${book.ch3_title}</h2><p contenteditable="true" style="font-size:18px; line-height:1.8;">${book.ch3_text}</p></div></div>
        <div class="a4-page"><div class="a4-content"><h2 contenteditable="true" style="color:var(--accent); font-family:'Anton'; font-size:50px;">${book.ch4_title}</h2><p contenteditable="true" style="font-size:18px; line-height:1.8;">${book.ch4_text}</p></div></div>
        <div class="a4-page"><div class="a4-content"><h2 contenteditable="true" style="color:var(--accent); font-family:'Anton'; font-size:50px;">${book.ch5_title}</h2><p contenteditable="true" style="font-size:18px; line-height:1.8;">${book.ch5_text}</p></div></div>
        <div class="a4-page"><div class="a4-content" style="justify-content:center; align-items:center; text-align:center;"><h1 contenteditable="true" style="font-family:'Anton'; font-size:60px;">THE END</h1><p contenteditable="true" style="font-size:20px;">${book.outro}</p></div></div>
    `;
}

// Generates Fabric JSONs in background without showing user
async function buildFabricAssets(aiData, bgUrl) {
    let tempCanvas = new fabric.Canvas(null, { width: 1080, height: 1080 });
    
    return new Promise((resolve) => {
        fabric.Image.fromURL(bgUrl, function(img) {
            
            // Generate POST (1080x1080)
            tempCanvas.clear(); tempCanvas.setWidth(1080); tempCanvas.setHeight(1080);
            let s1 = Math.max(1080/img.width, 1080/img.height);
            img.set({ scaleX: s1, scaleY: s1, left: 540, top: 540, originX: 'center', originY: 'center', isBg: true });
            tempCanvas.add(img);
            tempCanvas.add(new fabric.Rect({ width: 1080, height: 1080, fill: 'rgba(0,0,0,0.6)', selectable: false }));
            tempCanvas.add(new fabric.Textbox(aiData.kit.post_hook.toUpperCase(), { width: 900, left: 90, top: 200, fontSize: 100, fontFamily: 'Anton', fill: '#00F0FF', stroke: '#000', strokeWidth: 2, shadow: new fabric.Shadow({color:'black', blur:10}) }));
            tempCanvas.add(new fabric.Rect({ width: 900, height: 300, left: 90, top: 600, fill: 'rgba(20,20,30,0.9)', rx: 20, ry: 20 }));
            tempCanvas.add(new fabric.Textbox(aiData.kit.post_sub, { width: 800, left: 140, top: 650, fontSize: 40, fontFamily: 'Montserrat', fill: '#fff' }));
            appState.generatedAssets.post = JSON.stringify(tempCanvas.toJSON(['isBg']));

            // Generate REEL (1080x1920)
            tempCanvas.clear(); tempCanvas.setWidth(1080); tempCanvas.setHeight(1920);
            let s2 = Math.max(1080/img.width, 1920/img.height);
            img.set({ scaleX: s2, scaleY: s2, left: 540, top: 960, originX: 'center', originY: 'center', isBg: true });
            tempCanvas.add(img);
            tempCanvas.add(new fabric.Rect({ width: 1080, height: 1920, fill: 'rgba(0,0,0,0.6)', selectable: false }));
            tempCanvas.add(new fabric.Textbox(aiData.kit.reel_hook.toUpperCase(), { width: 900, left: 90, top: 300, fontSize: 130, fontFamily: 'Anton', fill: '#FF0050', textAlign: 'center' }));
            tempCanvas.add(new fabric.Rect({ width: 800, height: 150, left: 140, top: 1500, fill: '#00F0FF', rx: 75, ry: 75 }));
            tempCanvas.add(new fabric.Textbox(aiData.kit.reel_cta.toUpperCase(), { width: 800, left: 140, top: 1540, fontSize: 50, fontFamily: 'Montserrat', fill: '#000', textAlign: 'center', fontWeight: 'bold' }));
            appState.generatedAssets.reel = JSON.stringify(tempCanvas.toJSON(['isBg']));

            // Generate COVER (1748x2480)
            tempCanvas.clear(); tempCanvas.setWidth(1748); tempCanvas.setHeight(2480);
            let s3 = Math.max(1748/img.width, 2480/img.height);
            img.set({ scaleX: s3, scaleY: s3, left: 1748/2, top: 2480/2, originX: 'center', originY: 'center', isBg: true });
            tempCanvas.add(img);
            tempCanvas.add(new fabric.Rect({ width: 1748, height: 2480, fill: 'rgba(0,0,0,0.6)', selectable: false }));
            tempCanvas.add(new fabric.Textbox(aiData.book.title.toUpperCase(), { width: 1500, left: 124, top: 400, fontSize: 250, fontFamily: 'Anton', fill: '#00F0FF' }));
            tempCanvas.add(new fabric.Textbox(aiData.book.subtitle, { width: 1500, left: 124, top: 1000, fontSize: 80, fontFamily: 'Montserrat', fill: '#fff' }));
            appState.generatedAssets.cover = JSON.stringify(tempCanvas.toJSON(['isBg']));

            resolve();
        }, { crossOrigin: 'anonymous' });
    });
}

async function downloadKitZip() {
    updateLoader("PACKAGING KIT...");
    let zip = new JSZip();
    let imgFolder = zip.folder("Designs");
    
    // Function to render saved JSON back to dataURL off-screen
    const renderJSONtoURL = (jsonStr, w, h) => {
        return new Promise(resolve => {
            let tc = new fabric.StaticCanvas(null, {width: w, height: h});
            tc.loadFromJSON(jsonStr, () => {
                tc.renderAll();
                resolve(tc.toDataURL({format: 'png', quality: 1}).split('base64,')[1]);
            });
        });
    };

    if(appState.generatedAssets.cover) imgFolder.file("Cover_A5.png", await renderJSONtoURL(appState.generatedAssets.cover, 1748, 2480), {base64: true});
    if(appState.generatedAssets.post) imgFolder.file("Post_1x1.png", await renderJSONtoURL(appState.generatedAssets.post, 1080, 1080), {base64: true});
    if(appState.generatedAssets.reel) imgFolder.file("Reel_9x16.png", await renderJSONtoURL(appState.generatedAssets.reel, 1080, 1920), {base64: true});
    
    zip.file("Meta_Ad_Copy.txt", appState.adCopy);
    zip.file("Video_Script.txt", appState.script);

    zip.generateAsync({type:"blob"}).then(content => {
        saveAs(content, "QuickFare_Full_Kit.zip");
        hideLoader(); showToast("ZIP Downloaded!");
    });
}
