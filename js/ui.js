const appState = {
    currentCanvasType: 'post',
    generatedAssets: {
        post: null,
        reel: null,
        cover: null
    },
    adCopy: '',
    script: ''
};

const UI = {
    showToast(msg, isErr = false) {
        const t = document.getElementById('toast');
        if (!t) return console.log("Toast:", msg);
        t.innerText = msg;
        t.style.background = isErr ? "var(--danger)" : "var(--accent)";
        t.style.color = isErr ? "#fff" : "#000";
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    },

    updateLoader(title) {
        const l = document.getElementById('loader');
        const lt = document.getElementById('loader-text');
        if (l) l.style.display = 'flex';
        if (lt) lt.innerText = title;
    },

    hideLoader() {
        const l = document.getElementById('loader');
        if (l) l.style.display = 'none';
    },

    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        const btn = document.querySelector(`.tab-btn[onclick*="switchTab('${tabId}')"]`);
        if (btn) btn.classList.add('active');
        
        const tab = document.getElementById(`tab-${tabId}`) || document.getElementById(tabId);
        if (tab) tab.classList.add('active');

        // Workspace View Toggle
        const artboard = document.getElementById('artboard-wrapper');
        const ebook = document.getElementById('view-ebook');
        
        if (tabId === 'ai') {
            if (artboard) artboard.style.display = 'none';
            if (ebook) ebook.style.display = 'flex';
        } else {
            if (artboard) artboard.style.display = 'block';
            if (ebook) ebook.style.display = 'none';
            if (typeof fitArtboard === 'function') fitArtboard();
        }
    }
};

// Global Aliases for the new scripts
window.appState = appState;
window.showToast = UI.showToast;
window.updateLoader = UI.updateLoader;
window.hideLoader = UI.hideLoader;
window.switchTab = UI.switchTab;