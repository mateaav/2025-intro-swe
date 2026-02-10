# Git Workflow

## Što je git?

Git je alat koji nam daje mogućnost pračenja koda kojeg smo pisali kroz povjest razvoja projekt.

Da bi git mogao pratiti verzije našeg koda trebamo ga inicijalizirati za svaki projekt.

## Kreacija git repozitorija

Inicijalizacija projekta se radi sa komandom `git init` koja kreira folder `.git` koji sprema sve verzije našeg projekta.

Inicijalizacijom projekta smo kreirali repozitorij.

Kreacijom repozitorija smo spremni verzionirati naš projekt.

## Verzioniranje repozitorija

Verzioniranje postižemo commitima.
Commit je komanda koja nam omogućava kreiranje verzije našeg projekta tj. repozitorija.

Commitat možemo promjene u našem repozitoriju tj. negovim datotekama sa komandom `git commit`.

Da bi commitali promjene, promjene moramo stage-ati sa komandom `git add`.

### Prijmjer verzioniranja

1. Promijenimo neke file-ove i spremimo ih
2. Stage-amo sve file-ove u repozitoriju sa komandom `git add .`
3. Comitamo te promjene sa komandom `git commit -m "Primjer poruke"`

## Dijeljenje git repozitorija online

Git nam služi za kreaciju repozitorija lokalno (na računalu) koje onda možemo podijeliti na Github.
To radimo sa komandom `git push` ali tek nakon što smo postavili github repozitorij i povezali ga sa lokalnim git repozitorijem.
