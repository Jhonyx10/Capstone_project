// Slide down into place while fading in. The offset is negative, so the element
// never moves past its container's bottom edge and can't cause scrollbars.
export const fadeIn = (delay = 0) => ({
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25, ease: "easeOut", delay },
});

// Rows fade with opacity only. No transform means no overflow.
// The stagger is capped so long pages don't wait on the last row.
export const rowFade = (index = 0) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
        duration: 0.2,
        ease: "easeOut",
        delay: Math.min(index, 8) * 0.025,
    },
});
