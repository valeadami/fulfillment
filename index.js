
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const axios = require('axios');
const Prompts = require('./prompts/prompts.js');
const utility=require('./utility.js');
const Tools=require('./tools/tools.js');
const prenotazioni = []; // salvo qui le prenotazioni da sostituire con un database

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function getCompletionOpenAI(prompt, model = "gpt-4o", temperature=0) {
  const messages = [{ role: "user", content: prompt }];
  
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: model,
        messages: messages,
        temperature: temperature,
        
      },
      {
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': 'Bearer ' +  process.env.test    //apikey
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching completion:", error);
    throw error;
  }
}
//getMessagesClaude
async function getMessagesClaude(prompt, model = "claude-3-5-sonnet-20241022", temperature=0, max_tokens=250, system="", tools=[]) {
  const messages = [{ role: "user", content: prompt }];
  
  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: model,
        max_tokens:  max_tokens,
        messages: messages,
        temperature: temperature,
        system: system,
        tools: tools
        
      },
      {
        headers: {
          'Content-Type': 'application/json', 
          'x-api-key': process.env.claude,   //  claude_apikey
          'anthropic-version': '2023-06-01',
          
        }
      }
    );
    console.log(response.data);
    return response.data.content[0].text;
  } catch (error) {
    console.error("Error fetching completion:", error);
    throw error;
  }
}
app.get('/', function(req, res, next) {
      console.log('nel root');
      //console.log(Prompts.DAILYSPECIALS_SYSTEM_PROMPT);
      res.send("Welcome to the main page!");
});

/*  OpenAI*/
app.post('/v1/fulfillment', async (req, res) => {
  console.log('****************** in /v1/fulfillment')
  const prompt = req.body.prompt; 
  console.log(`prompt utente:  ${prompt}`);
  if (!prompt) {
    return res.status(400).send({ error: "Prompt is required" });
  }

  try {
    const completion = await getCompletionOpenAI(prompt,"gpt-4o"); 
    console.log(completion);
    res.status(200).json({ completion });
   //res.status(200).json({answers:result.choices[0].message.content}); 
  } catch (error) {
    res.status(500).send({ error: "Failed to get completion" });
  }
});

/*  Claude */
app.post('/v1/claude', async (req, res) => {
  console.log('****************** in /v1/claude')
 
  try {
    if (!utility.checkPromptValidity(req)) {
      return res.status(400).send({ error: "Prompt is required" });
    }
    
    // Verifica e imposta i parametri opzionali
   if (!utility.checkParamsValid(req)) {
      return res.status(400).send({ 
        error: "Invalid parameter types or values" 
      });
    }
    // A questo punto req.body contiene tutti i parametri, 
    // sia quelli forniti che quelli di default
    const { prompt, model, max_tokens, temperature, system, tools } = req.body;
    console.log( model, max_tokens, temperature, system);
    const completion = await getMessagesClaude(prompt,model,temperature,max_tokens,system, tools); 
    console.log(completion);
    res.status(200).json({ completion });
   //res.status(200).json({answers:result.choices[0].message.content}); 
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to get completion" });
  }
});

// specialità del giorno
app.post('/v1/daily-specials', async (req, res) => {
  console.log('****************** in /v1/daily-specials')
  try {
    if (!utility.checkPromptValidity(req)) {
      return res.status(400).send({ error: "Prompt is required" });
    }
    
    // Verifica e imposta i parametri opzionali
   if (!utility.checkParamsValid(req)) {
      return res.status(400).send({ 
        error: "Invalid parameter types or values" 
      });
    }
 
    const { prompt, model, max_tokens, temperature, system, tools } = req.body;
    
    const completion = await getMessagesClaude(prompt,model,temperature,max_tokens,Prompts.DAILYSPECIALS_SYSTEM_PROMPT, tools); 
    console.log(completion);
    res.status(200).json({ completion });
   
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to get completion" });
  }
});

// aggiungo una prenotazione 
app.post('/v1/prenotazioni', async (req, res) => {
  console.log('****************** POST in /v1/prenotazioni')
  try {
      const { dataPrenotazione, oraPrenotazione, numPersone, phone, nominativo } = req.body;
      if (!dataPrenotazione || !oraPrenotazione || !numPersone || !phone || !nominativo) {
        return res.status(400).send({ 
        error: "All fields are required and cannot be empty." 
      });
    }
 
    const idPrenotazione = `RES-${Date.now()}`;
    const prenotazione = {
      id: idPrenotazione, // RES-1731778826823
      dataPrenotazione,
      oraPrenotazione,
      numPersone,
      phone,
      nominativo
    };
    prenotazioni.push(prenotazione);
    console.log(prenotazioni);
    const result = {
      success: true,
      message: "Prenotazione aggiunta con successo",
      prenotazioni: prenotazione, 
      status: 200
  };
  
    res.status(200).json({ result });
   
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to make a reservation" });
  }
});
//GET prenotazioni leggo tutte le prenotazioni
app.get('/v1/prenotazioni', async (req, res) => {
  console.log('****************** GET in /v1/prenotazioni')
  try {
    const result = {
      success: true,
      message: prenotazioni.length > 0 ? "Prenotazioni recuperate con successo" : "Nessuna prenotazione trovata",
      prenotazioni: prenotazioni,
      status: 200
    };

    res.status(200).json(result);

  } catch (error) {
    console.error("Errore durante il recupero delle prenotazioni:", error);

    res.status(500).json({
      success: false,
      message: "Errore interno del server durante il recupero delle prenotazioni",
      error: error.message,
      status: 500
    });
  }
});
//recupero una singola prenotazione per codice RES-id_prenotazione
app.get('/v1/prenotazioni/:id', (req, res) => {
  console.log('****************** GET in /v1/prenotazioni/:id');
  const { id } = req.params;

  try {
      // Trova la prenotazione corrispondente all'ID
      const prenotazione = prenotazioni.find(p => p.id === id);

      if (!prenotazione) {
          return res.status(404).send({
              success: false,
              message: `Prenotazione con ID ${id} non trovata`
          });
         
      }

      // Restituisci la prenotazione trovata
      res.status(200).json({
          success: true,
          message: "Prenotazione trovata",
          prenotazioni: prenotazione
      });

  } catch (error) {
      console.error("Errore durante il recupero della prenotazione:", error);
      res.status(500).json({
          success: false,
          message: "Errore interno del server",
          error: error.message
      });
  }
});
//EDIT di una prenotazione
app.put('/v1/prenotazioni/:id', (req, res) => {
  console.log('****************** PUT in /v1/prenotazioni/:id');

  const { id } = req.params; // ID della prenotazione da modificare
  const { dataPrenotazione, oraPrenotazione, numPersone, phone, nominativo } = req.body; // Nuovi dati

  try {
      // Trova l'indice della prenotazione da aggiornare
      const index = prenotazioni.findIndex(p => p.id === id);

      if (index === -1) {
          // Prenotazione non trovata
          return res.status(404).json({
              success: false,
              message: `Prenotazione con ID ${id} non trovata`
          });
      }

      // Validazione dei nuovi dati (opzionale ma consigliato)
      if (!dataPrenotazione || !oraPrenotazione || !numPersone || !phone || !nominativo) {
          return res.status(400).json({
              success: false,
              message: "Tutti i campi sono obbligatori"
          });
      }

      // Aggiorna i dati della prenotazione
      prenotazioni[index] = {
          id, // Mantieni l'ID originale
          dataPrenotazione,
          oraPrenotazione,
          numPersone,
          phone,
          nominativo
      };

      // Rispondi con la prenotazione aggiornata
      res.status(200).json({
          success: true,
          message: "Prenotazione aggiornata con successo",
          data: prenotazioni[index]
      });

  } catch (error) {
      console.error("Errore durante l'aggiornamento della prenotazione:", error);

      res.status(500).json({
          success: false,
          message: "Errore interno del server durante l'aggiornamento della prenotazione",
          error: error.message
      });
  }
});

//per test Voiceflow
//menu 
app.get('/v1/menu', function(req,res,next) {

  let menu={
    "menu": [
      "Grilled Chicken",
      "Hamburger",
      "Sandwich",
      "Focaccia"
    ]
  }
  res.status(200).json({answers:menu});
});

//bevande
app.get('/v1/bevande', function(req, res,next) {
  let bevande={
    "beverages":[
      "Light Beer",
      "Dark Beer",
      "Special Beer",
      "Coca Cola",
      "Still Water"
    ]
  };
  res.status(200).json({answers:bevande});
});

//post reservations

app.listen(process.env.PORT || 3000, function() {
    console.log("App started on port 3000");
  });