# Reorganisation et redesign - Thrina Creation

## Nouvelle base statique

Ce projet a ete reorganise en HTML/CSS/JS simple avec une logique front locale.

### Pages principales
- `index.html` : accueil + catalogue + ajout panier
- `panier.html` : panier + commande invite (sans compte requis)
- `compte.html` : creation de compte client optionnelle
- `connexion.html` : connexion client optionnelle
- `admin.html` : connexion admin + gestion commandes + publication d'articles

### Assets
- `css/app.css` : design global responsive
- `js/store.js` : donnees produits, panier, commandes, comptes et session admin
- `js/app.js` : UI commune (menu, cartes produits, badge panier)
- `js/cart.js` : logique panier + validation commande
- `js/auth.js` : inscription/connexion client
- `js/admin.js` : dashboard admin commandes + produits

## Compte admin simple
- Email : `admin@thrina.local`
- Mot de passe : `admin123`

## Note technique
Les donnees sont stockees dans `localStorage` pour garder une architecture 100% HTML/CSS/JS.
