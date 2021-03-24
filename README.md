# Angular Navigation POC (WIP)
Angular Navigatione POC - Named Router Outlets with Dialogs


## Introduzione
Il progetto si pone come obbiettivo quello di implementare dinamicamente la creazione di router outlet secondari su modali per innestare fino a N livelli di modali navigabili. 

Ogni modale dovrà permette all'utente di navigare in avanti oppure di tornare ai componenti precedentemente visualizzati sulla modale stessa senza andare a influire nella navigazione delle altre modali o della route principale.


## Punti chiave

- **route.service.ts**: servizio che dovrebbe gestire tutti gli aspetti della navigazione, history stack e salvataggio parametri

## Info

- **route.service.ts - primary router outlet**:  ho differenziato la gestione del router primario da quelli secondari. La gestione dello stack per il router primario viene effettuata principalmente mettendosi in ascolto degli eventi di routing rilanciti da Angular mentre quelli secondari per popolare la struttura dati di stack vengono gestiti a mano nei metodi `nagivate` e `goBack`.

- **route.service.ts**: ho esposto sulla window il service, ora da console basta chiamare `routeService.status` per vedere qual'è lo stato di navigazione e qundi (stack e strutture dati salvate dei componenti). 
  - *routerOutletStack (property)*: stack dei router outlet istanziati dall'applicazione. In prima posizione abbiamo sempre il router outlet primario. In ultima posizione il router outlet attualmente attivo.
  - *componentSessionContext (property)*: mappa dove per ogni componente viene salvato il context del componente stesso. La chiave per accedere è l'ID univoco del componente generato in fase di navigazione.
  - *generateComponentID (method)*: la generazione dell'ID univoco del componente viene gestita direttamente nel metodo `navigate` grazie al metodo `generateComponentID` e non più nel singolo componente. Quando navighiamo ad un componente generiamo l'ID univico e lo passiamo come parametro in query string (se siamo su routing primario) o lo salviamo nello stack di parametri del service (su routing secondario). Il componente poi lo inizializza al pari degli altri parametri.
- **route.model.ts**: contiene le classi principali di modello.
  - *Context (interface)*: interfaccia da estendere per creare l'oggetto concreto che rappresenta il contesto di uno specifico componente. Es: il contesto del componente first è rappresentanto dall'oggetto `FirstContext` che quindi rappresenta uno snapshot completo del componente in un determinato momento.
  - *Routable (interface)*: interfaccia che devono estendere i componenti angular che vanno inseriti all'interno di un flusso navigabile. Forza l'implementazione del metodo `saveContext` che viene richiamato in automatico dal route.service.ts nei metodi `navigate` e `back` prima di passare al componente successivo. 
## Punti aperti
- **resetRouterHistory()**: va implementato il metodo che resetta lo stack e i contesti dei componenti. Utile da richiamare se vogliamo svuotare la cache
- **getContext()**: va implementato il metodo che ricorsivamente ed in ordine iverso restituisce tutti i contesti dei componenti precedenti.
- **getContextById()**: va implementato il metodo che restituisce il contesto specifico di un componente. Questo ci torna utile quando al refresh dobbiamo eventualmente ripristinare lo stato del componente partendo dal suo ID univico.
- **pulizia stack e stato componenti**: andrebbe analizzato meglio come e quando ripulire lo stack di navigazione e lo stato dei componenti salvati altrimenti per come è implementato ora continuiamo ad incrementare le strutture.
- **gestione query params**: i query params sono comuni sia al primary outlet che ai secondary outlet, l'idea è che solo il primary outlet sfrutti questi paramentri mentre sui secondary outlet tutto viene gestito da uno stack nel service `route.service.ts`
- **pulizia codice / refactoring / semplificazione**: valutare se alcune logiche / implementazioni nel `route.service.ts` possono in realtà essere semplificate / rifattorizzate così da permettere anche una più facile gestione in futuro.
- **dipendenza circolare**: risolvere la dipendenza circolare di `route.service.ts` verso `app-routing.module.ts` e quindi verso i componenti che vengono istanziati nell'applicazione. Sfruttare l'injection Angular per iniettare le route nel `route.service.ts` evitando così la dipendenza circolare. 


## References

Thanks to https://github.com/dawidgarus for the `named-outlet.directive.ts`