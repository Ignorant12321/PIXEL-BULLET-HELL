export function moveProjectile(projectile, dt) {
  const sx = projectile.vx * dt;
  const sy = projectile.vy * dt;
  projectile.x += sx;
  projectile.y += sy;
  projectile.traveled = (projectile.traveled || 0) + Math.hypot(sx, sy);
  projectile.life -= dt;
}
