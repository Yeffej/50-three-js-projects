export const canvas = document.getElementById('webgl');
export const sizes = {
    w: window.innerWidth,
    h: window.innerHeight,
    get aspectRatio() {
        return this.w / this.h;
    },
    get pixelRatio() {
        return Math.min(window.devicePixelRatio, 2);
    },
    update() {
        this.w = window.innerWidth;
        this.h = window.innerHeight;
    }
}
