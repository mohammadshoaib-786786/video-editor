// Brand defaults shared by every project (load after kit/sprites.js).
// The host is the owner's cartoon. To change it, replace the files in
// kit/avatars/ (transparent PNG, waist-up) and update size/eyes below.
window.AVATAR = window.AVATAR || {
  image: "kit/avatars/host.png", // waist-up, raised fist on the viewer's right
  face: "kit/avatars/host-face.png", // square head crop for avatar circles
  size: [1160, 1207], // image pixels
  eyes: [
    [455, 370, 26, 34], // [cx, cy, rx, ry] in image pixels, for blink lids
    [615, 372, 26, 34],
  ],
  skin: "#f6c296",
};

// Compositions wait on this before building, so the first frame never
// renders without the host.
window.AVATAR_READY = Promise.all(
  [window.AVATAR.image, window.AVATAR.face].filter(Boolean).map((src) => {
    const img = new Image();
    img.src = src;
    return img.decode().catch(() => {});
  }),
);
