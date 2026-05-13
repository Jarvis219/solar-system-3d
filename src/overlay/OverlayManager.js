export class OverlayManager {
  constructor(scrollManager) {
    this.panels = document.querySelectorAll('.section-panel');
    this.navBtns = document.querySelectorAll('#planet-nav .nav-btn');
    this.loadingScreen = document.getElementById('loading-screen');
    this.loadingFill = document.getElementById('loading-fill');

    scrollManager.onChange((section) => this._show(section));

    this.navBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        scrollManager.goTo(parseInt(btn.dataset.section));
      });
    });

    this._show(0);
  }

  _show(index) {
    this.panels.forEach((panel) => {
      panel.classList.toggle('active', parseInt(panel.dataset.section) === index);
    });
    this.navBtns.forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.dataset.section) === index);
    });
  }

  updateLoadingProgress(percent) {
    if (this.loadingFill) {
      this.loadingFill.style.width = `${percent}%`;
    }
  }

  hideLoading() {
    setTimeout(() => {
      this.loadingScreen.classList.add('hidden');
      setTimeout(() => {
        this.loadingScreen.style.display = 'none';
      }, 1000);
    }, 500);
  }
}
