/* Utility functions */
/*function checkBodyValidity(req){

    const prompt = req.body.prompt; 
 
    if (!prompt) {
      return false;
    }
    return true;
}*/
const MAX_INPUT_LENGHT=4096;
function checkPromptValidity(req, maxLength = MAX_INPUT_LENGHT) {
    console.log(' in checkPromptValidity');
    try {
      // Verifica base con optional chaining
      if (!req.body.prompt) {
        return false;
      }
  
      const prompt = req.body.prompt;
  
      // Verifica tipo e contenuto
      if (typeof prompt !== 'string' || prompt.trim() === '') {
        return false;
      }
  
      // Verifica lunghezza massima
      if (prompt.length > maxLength) {
        return false;
      }
  
      return true;
    } catch (error) {
      console.error('Error in validation - checkPromptValidity:', error);
      return false;
    }

   
  }
   //valido i parametri in input 
   function checkParamsValid(req) {
    console.log(' in checkParamsValid');
    try {
        if (!req.body.model) req.body.model = "claude-3-5-sonnet-20241022";
        if (!req.body.max_tokens) req.body.max_tokens = 250;
        if (req.body.temperature === undefined) req.body.temperature = 0;
        if (!req.body.system) req.body.system = "";
        if (!req.body.tools) req.body.tools = [];
        const { model, max_tokens, temperature, system, tools } = req.body || {};
        if (model && typeof max_tokens === 'number' && max_tokens > 0 &&
            typeof temperature === 'number' && temperature >= 0 && temperature <= 1 &&
            typeof system === 'string' && Array.isArray(tools)) 
            {
                console.log('checkParamsValid=true');
                return true;
            } else {
                console.log('checkParamsValid=false');
                return false;
            }
     
             
    } catch (error) {
      console.error('Error validating Claude parameters:', error);
      return false;
    }
  }
module.exports.checkPromptValidity= checkPromptValidity;
module.exports.checkParamsValid=checkParamsValid;