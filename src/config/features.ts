/**
 * Passez à `true` une fois le domaine aibraacademy.com vérifié sur Resend
 * (DKIM + SPF confirmés à la fois dans Namecheap et dans le dashboard Resend
 * — onglet "Domains" du projet Resend). Tant que c'est `false`, le modal de
 * candidature présélectionne l'envoi via le client mail local (mailto), plus
 * fiable pour la délivrabilité pendant que la réputation du domaine se construit.
 */
export const RESEND_DOMAIN_VERIFIED = false;
