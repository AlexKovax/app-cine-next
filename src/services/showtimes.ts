import type { Cinema, Showtime, Config } from '../types';
import { addLog } from './logging';

interface ExtractShowtimesResponse {
  showtimes: Showtime[];
}

function buildJinaUrl(cinemaUrl: string): string {
  const today = new Date().toISOString().split('T')[0];
  const urlWithDate = cinemaUrl.includes('#')
    ? cinemaUrl.replace(/#shwt_date=[^&]*/, `#shwt_date=${today}`)
    : `${cinemaUrl}#shwt_date=${today}`;
  return `https://r.jina.ai/${encodeURIComponent(urlWithDate)}`;
}

async function fetchMarkdown(cinema: Cinema): Promise<string> {
  const jinaUrl = buildJinaUrl(cinema.url);
  const startTime = Date.now();
  
  addLog({
    service: 'jina',
    level: 'info',
    cinemaId: cinema.id,
    cinemaName: cinema.name,
    message: `Récupération Jina: ${jinaUrl.substring(0, 80)}...`,
    details: { request: { url: jinaUrl, cinemaUrl: cinema.url } }
  });
  
  try {
    const response = await fetch(jinaUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    const duration = Date.now() - startTime;
    
    addLog({
      service: 'jina',
      level: 'success',
      cinemaId: cinema.id,
      cinemaName: cinema.name,
      message: `Jina OK - ${text.length} caractères en ${duration}ms`,
      details: { 
        duration,
        markdownLength: text.length,
        response: text.substring(0, 2000) + (text.length > 2000 ? '...' : '')
      }
    });
    
    return text;
  } catch (error) {
    const duration = Date.now() - startTime;
    addLog({
      service: 'jina',
      level: 'error',
      cinemaId: cinema.id,
      cinemaName: cinema.name,
      message: `Jina ERREUR: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { 
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    throw error;
  }
}

function compressMarkdown(markdown: string): string {
  return markdown
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function filterAndSortShowtimes(showtimes: Showtime[]): Showtime[] {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // Filtrer les séances dans les 30 prochaines minutes
  const filtered = showtimes.filter(showtime => {
    const [hours, minutes] = showtime.time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return false;

    const showtimeInMinutes = hours * 60 + minutes;
    const diffMinutes = showtimeInMinutes - currentTimeInMinutes;

    // Garder uniquement les séances dans les 30 prochaines minutes (et pas dans le passé)
    return diffMinutes >= 0 && diffMinutes <= 30;
  });

  // Trier par ordre chronologique
  const sorted = filtered.sort((a, b) => {
    const [hoursA, minutesA] = a.time.split(':').map(Number);
    const [hoursB, minutesB] = b.time.split(':').map(Number);
    const timeA = hoursA * 60 + minutesA;
    const timeB = hoursB * 60 + minutesB;
    return timeA - timeB;
  });

  return sorted;
}

async function callOpenRouter(
  markdown: string,
  config: Config,
  currentTime: string,
  cinema: Cinema
): Promise<ExtractShowtimesResponse> {
  const compressedMarkdown = compressMarkdown(markdown);
  
  const systemPrompt = `Tu es un assistant spécialisé dans l'extraction de données de séances de cinéma depuis des pages AlloCiné.

Heure actuelle : ${currentTime}

MISSION : Extraire UNIQUEMENT les séances commençant dans les 30 prochaines minutes.

FORMAT DES DONNÉES EN ENTRÉE :
Les titres de films apparaissent sous cette forme :
[Titre du Film](https://www.allocine.fr/film/fichefilm_gen_cfilm=XXXXX.html)

Exemples réels :
[Marty Supreme](https://www.allocine.fr/film/fichefilm_gen_cfilm=1000007317.html)
[Le Rêve américain](https://www.allocine.fr/film/fichefilm_gen_cfilm=1000012480.html)
[Le Mystérieux regard du flamant rose](https://www.allocine.fr/film/fichefilm_gen_cfilm=298832.html)

Les séances apparaissent sous cette forme :
[HH:MM Réserver](URL_MK2 "Réserver")

Exemples :
[13:15 Réserver](https://www.mk2.com/panier/seance/tickets?cinemaId=0005&sessionId=35196 "Réserver")
[16:30 Réserver](https://www.mk2.com/panier/seance/tickets?cinemaId=0004&sessionId=127367 "Réserver")

STRUCTURE : Chaque film est suivi de ses séances. Il peut y avoir plusieurs films, chacun avec plusieurs séances.

RÈGLES D'EXTRACTION :
1. Pour chaque séance dans les 30 prochaines minutes, extraire :
   - title : titre du film (texte entre [ et ] avant le lien AlloCiné)
   - time : horaire (HH:MM extrait du premier [HH:MM Réserver])
   - room : salle si mentionnée (optionnel)
   - version : VF, VO, 3D, etc. si mentionné (optionnel)
   - filmUrl : URL complète du film sur AlloCiné

2. Ne garder que les séances dont l'horaire est dans les 30 prochaines minutes par rapport à ${currentTime}

3. Répondre UNIQUEMENT en JSON valide :
{"showtimes":[{"title":"...","time":"HH:MM","room":"...","version":"...","filmUrl":"..."}]}

Si aucune séance ne correspond, répondre exactement : {"showtimes":[]}`;

  addLog({
    service: 'openrouter',
    level: 'info',
    cinemaId: cinema.id,
    cinemaName: cinema.name,
    message: `Appel OpenRouter - ${config.models.length} modèle(s) disponible(s)`,
    details: {
      prompt: systemPrompt,
      markdownLength: compressedMarkdown.length,
      models: config.models
    }
  });

  const errors: string[] = [];

  for (const model of config.models) {
    const startTime = Date.now();
    
    addLog({
      service: 'openrouter',
      level: 'info',
      cinemaId: cinema.id,
      cinemaName: cinema.name,
      message: `Tentative avec ${model}...`,
      details: { model }
    });
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CinéNext',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: compressedMarkdown },
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        errors.push(`${model}: ${error}`);
        
        addLog({
          service: 'openrouter',
          level: 'error',
          cinemaId: cinema.id,
          cinemaName: cinema.name,
          message: `Erreur HTTP ${model}: ${response.status}`,
          details: { model, error }
        });
        
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      const duration = Date.now() - startTime;

      addLog({
        service: 'openrouter',
        level: 'info',
        cinemaId: cinema.id,
        cinemaName: cinema.name,
        message: `Réponse reçue de ${model} en ${duration}ms`,
        details: { 
          model, 
          duration,
          response: content?.substring(0, 2000) || 'Empty'
        }
      });

      if (!content) {
        errors.push(`${model}: Empty response`);
        continue;
      }

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        const parsed = JSON.parse(jsonStr);
        
        if (Array.isArray(parsed.showtimes)) {
          addLog({
            service: 'openrouter',
            level: 'success',
            cinemaId: cinema.id,
            cinemaName: cinema.name,
            message: `Succès ! ${parsed.showtimes.length} séance(s) trouvée(s)`,
            details: { 
              model, 
              duration,
              response: parsed
            }
          });
          return parsed;
        } else {
          errors.push(`${model}: Invalid format`);
          
          addLog({
            service: 'openrouter',
            level: 'warning',
            cinemaId: cinema.id,
            cinemaName: cinema.name,
            message: `${model}: Format invalide`,
            details: { model, response: parsed }
          });
        }
      } catch (parseError) {
        errors.push(`${model}: JSON parse error`);
        
        addLog({
          service: 'openrouter',
          level: 'warning',
          cinemaId: cinema.id,
          cinemaName: cinema.name,
          message: `${model}: Erreur de parsing JSON`,
          details: { 
            model, 
            error: parseError instanceof Error ? parseError.message : 'Parse error',
            response: content?.substring(0, 500)
          }
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${model}: ${errorMsg}`);
      
      addLog({
        service: 'openrouter',
        level: 'error',
        cinemaId: cinema.id,
        cinemaName: cinema.name,
        message: `${model}: ${errorMsg}`,
        details: { model, error: errorMsg }
      });
    }
  }

  const errorMsg = `All models failed: ${errors.join('; ')}`;
  
  addLog({
    service: 'openrouter',
    level: 'error',
    cinemaId: cinema.id,
    cinemaName: cinema.name,
    message: 'Tous les modèles ont échoué',
    details: { error: errorMsg, errors }
  });

  throw new Error(errorMsg);
}

export async function fetchShowtimes(
  cinema: Cinema,
  config: Config,
  onProgress?: (message: string) => void
): Promise<{ markdown: string; showtimes: Showtime[] }> {
  onProgress?.('Récupération de la page...');
  const markdown = await fetchMarkdown(cinema);

  onProgress?.('Analyse avec l\'IA...');
  const currentTime = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const result = await callOpenRouter(markdown, config, currentTime, cinema);

  // Filtre et tri côté client pour ne garder que les séances dans les 30 prochaines minutes, triées par ordre chronologique
  const filteredShowtimes = filterAndSortShowtimes(result.showtimes);

  if (filteredShowtimes.length !== result.showtimes.length) {
    addLog({
      service: 'app',
      level: 'info',
      cinemaId: cinema.id,
      cinemaName: cinema.name,
      message: `Filtrage client: ${result.showtimes.length - filteredShowtimes.length} séance(s) hors délai supprimée(s)`,
      details: {
        totalReceived: result.showtimes.length,
        afterFilter: filteredShowtimes.length,
        removed: result.showtimes.filter(st => !filteredShowtimes.includes(st)).map(st => st.time)
      }
    });
  }

  return { markdown, showtimes: filteredShowtimes };
}
