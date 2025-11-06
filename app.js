class AppRutas {
    constructor() {
        this.lugares = [];
        this.matrizAdy = [];
        this.matrizCostos = [];
        this.grafo = {};
        this.showWeights = true;
        
        // Referencias a elementos DOM
        this.originSelect = document.getElementById('origin');
        this.destinationSelect = document.getElementById('destination');
        this.searchBtn = document.getElementById('search-btn');
        this.dijkstraResult = document.getElementById('dijkstra-result');
        this.floydResult = document.getElementById('floyd-result');
        this.routeResult = document.getElementById('route-result');
        this.canvas = document.getElementById('graph-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resetViewBtn = document.getElementById('reset-view');
        this.toggleWeightsBtn = document.getElementById('toggle-weights');
        
        this.init();
    }
    
    init() {
        // Configurar el tamaño del canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Cargar datos de ejemplo con más nodos
        this.cargarDatosEjemplo();
        
        // Configurar eventos
        this.searchBtn.addEventListener('click', () => this.buscarRuta());
        this.resetViewBtn.addEventListener('click', () => this.dibujarMapa());
        this.toggleWeightsBtn.addEventListener('click', () => this.toggleWeights());
        
        // Dibujar el mapa inicial
        this.dibujarMapa();
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.dibujarMapa();
    }
    
    cargarDatosEjemplo() {
        // 15 nodos con letras del alfabeto
        this.lugares = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
        
        // Matriz de adyacencia optimizada para rutas con múltiples nodos intermedios
        this.matrizAdy = [
            // A, B, C, D, E, F, G, H, I, J, K, L, M, N, O
            [0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0], // A - Centro
            [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0], // B - Norte
            [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1], // C - Sur
            [1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0], // D - Este
            [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1], // E - Oeste
            [0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0], // F - Noreste
            [0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], // G - Noroeste
            [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1], // H - Sureste
            [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // I - Suroeste
            [1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0], // J - Universidad
            [0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0], // K - Hospital
            [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1], // L - Aeropuerto
            [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0], // M - Estación
            [1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1], // N - Plaza Central
            [0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0]  // O - Zona Industrial
        ];
        
        // Matriz de costos optimizada para rutas interesantes
        this.matrizCostos = [
            // A, B, C, D, E, F, G, H, I, J, K, L, M, N, O
            [0, 4, 5, 3, 6, Infinity, Infinity, Infinity, Infinity, 2, Infinity, Infinity, 4, 1, Infinity], // A
            [4, 0, Infinity, Infinity, Infinity, 3, 4, Infinity, Infinity, Infinity, Infinity, Infinity, Infinity, Infinity, Infinity], // B
            [5, Infinity, 0, Infinity, Infinity, Infinity, Infinity, 5, 4, Infinity, 2, Infinity, 3, Infinity, 6], // C
            [3, Infinity, Infinity, 0, 5, 2, Infinity, 3, Infinity, 4, Infinity, 8, Infinity, Infinity, Infinity], // D
            [6, Infinity, Infinity, 5, 0, Infinity, 3, Infinity, 2, Infinity, Infinity, Infinity, Infinity, 4, 5], // E
            [Infinity, 3, Infinity, 2, Infinity, 0, Infinity, Infinity, Infinity, 6, Infinity, 9, Infinity, Infinity, Infinity], // F
            [Infinity, 4, Infinity, Infinity, 3, Infinity, 0, Infinity, Infinity, 7, Infinity, Infinity, Infinity, Infinity, Infinity], // G
            [Infinity, Infinity, 5, 3, Infinity, Infinity, Infinity, 0, Infinity, Infinity, 4, Infinity, 7, 5, 8], // H
            [Infinity, Infinity, 4, Infinity, 2, Infinity, Infinity, Infinity, 0, Infinity, Infinity, Infinity, Infinity, 3, 4], // I
            [2, Infinity, Infinity, 4, Infinity, 6, 7, Infinity, Infinity, 0, 4, Infinity, Infinity, Infinity, Infinity], // J
            [Infinity, Infinity, 2, Infinity, Infinity, Infinity, Infinity, 4, Infinity, 4, 0, 6, 2, Infinity, Infinity], // K
            [Infinity, Infinity, Infinity, 8, Infinity, 9, Infinity, Infinity, Infinity, Infinity, 6, 0, 5, Infinity, 10], // L
            [4, Infinity, 3, Infinity, Infinity, Infinity, Infinity, 7, Infinity, Infinity, 2, 5, 0, 6, Infinity], // M
            [1, Infinity, Infinity, Infinity, 4, Infinity, Infinity, 5, 3, Infinity, Infinity, Infinity, 6, 0, 7], // N
            [Infinity, Infinity, 6, Infinity, 5, Infinity, Infinity, 8, 4, Infinity, Infinity, 10, Infinity, 7, 0]  // O
        ];
        
        // Construir el grafo
        this.grafo = {};
        for (let i = 0; i < this.lugares.length; i++) {
            this.grafo[this.lugares[i]] = {};
            for (let j = 0; j < this.lugares.length; j++) {
                if (this.matrizAdy[i][j] === 1 && i !== j) {
                    this.grafo[this.lugares[i]][this.lugares[j]] = this.matrizCostos[i][j];
                }
            }
        }
        
        // Llenar los selectores
        this.limpiarSelectores();
        this.lugares.forEach(lugar => {
            const option1 = document.createElement('option');
            option1.value = lugar;
            option1.textContent = lugar;
            this.originSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = lugar;
            option2.textContent = lugar;
            this.destinationSelect.appendChild(option2);
        });
    }
    
    limpiarSelectores() {
        // Limpiar selectores antes de llenarlos
        this.originSelect.innerHTML = '<option value="">Selecciona un origen</option>';
        this.destinationSelect.innerHTML = '<option value="">Selecciona un destino</option>';
    }
    
    toggleWeights() {
        this.showWeights = !this.showWeights;
        this.toggleWeightsBtn.innerHTML = this.showWeights ? 
            '<i class="fas fa-weight-hanging"></i> Ocultar Pesos' : 
            '<i class="fas fa-weight-hanging"></i> Mostrar Pesos';
        this.dibujarMapa();
    }
    
    dibujarMapa(ruta = null) {
        // Limpiar el canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Configurar el estilo
        this.ctx.font = '14px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Posiciones de los nodos en un diseño optimizado para rutas interesantes
        const posiciones = this.calcularPosicionesOptimizadas();
        const radio = 22;
        
        // Dibujar aristas primero
        this.dibujarAristas(posiciones, ruta);
        
        // Dibujar nodos después (para que queden sobre las aristas)
        this.dibujarNodos(posiciones, ruta, radio);
        
        // Dibujar título del grafo
        this.dibujarTitulo();
    }
    
    calcularPosicionesOptimizadas() {
        const posiciones = {};
        const centroX = this.canvas.width / 2;
        const centroY = this.canvas.height / 2;
        const radioExterior = Math.min(centroX, centroY) - 80;
        const radioInterior = radioExterior * 0.6;
        
        // Posiciones estratégicas para forzar rutas con múltiples nodos
        posiciones['A'] = { x: centroX, y: centroY }; // Centro
        
        // Nodos norte (arriba)
        posiciones['B'] = { x: centroX, y: centroY - radioExterior }; // Norte
        posiciones['F'] = { x: centroX + radioInterior * 0.7, y: centroY - radioInterior * 0.7 }; // Noreste
        posiciones['G'] = { x: centroX - radioInterior * 0.7, y: centroY - radioInterior * 0.7 }; // Noroeste
        
        // Nodos sur (abajo)
        posiciones['C'] = { x: centroX, y: centroY + radioExterior }; // Sur
        posiciones['H'] = { x: centroX + radioInterior * 0.7, y: centroY + radioInterior * 0.7 }; // Sureste
        posiciones['I'] = { x: centroX - radioInterior * 0.7, y: centroY + radioInterior * 0.7 }; // Suroeste
        
        // Nodos este (derecha)
        posiciones['D'] = { x: centroX + radioExterior, y: centroY }; // Este
        
        // Nodos oeste (izquierda)
        posiciones['E'] = { x: centroX - radioExterior, y: centroY }; // Oeste
        
        // Puntos de interés estratégicamente ubicados
        posiciones['J'] = { x: centroX + radioInterior * 0.5, y: centroY - radioInterior * 0.3 }; // Universidad
        posiciones['K'] = { x: centroX - radioInterior * 0.5, y: centroY + radioInterior * 0.3 }; // Hospital
        posiciones['L'] = { x: centroX + radioExterior * 0.8, y: centroY - radioExterior * 0.3 }; // Aeropuerto
        posiciones['M'] = { x: centroX, y: centroY + radioInterior * 0.5 }; // Estación
        posiciones['N'] = { x: centroX - radioInterior * 0.3, y: centroY - radioInterior * 0.2 }; // Plaza Central
        posiciones['O'] = { x: centroX - radioExterior * 0.7, y: centroY + radioExterior * 0.5 }; // Zona Industrial
        
        return posiciones;
    }
    
    dibujarAristas(posiciones, ruta) {
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < this.lugares.length; i++) {
            for (let j = i + 1; j < this.lugares.length; j++) {
                if (this.matrizAdy[i][j] === 1) {
                    const lugar1 = this.lugares[i];
                    const lugar2 = this.lugares[j];
                    const pos1 = posiciones[lugar1];
                    const pos2 = posiciones[lugar2];
                    
                    // Resaltar aristas que forman parte de la ruta
                    if (ruta && this.esAristaEnRuta(lugar1, lugar2, ruta)) {
                        this.ctx.strokeStyle = '#00CED1';
                        this.ctx.lineWidth = 4;
                        this.ctx.shadowColor = '#00CED1';
                        this.ctx.shadowBlur = 10;
                    } else {
                        this.ctx.strokeStyle = '#555';
                        this.ctx.lineWidth = 2;
                        this.ctx.shadowColor = 'transparent';
                        this.ctx.shadowBlur = 0;
                    }
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(pos1.x, pos1.y);
                    this.ctx.lineTo(pos2.x, pos2.y);
                    this.ctx.stroke();
                    
                    // Dibujar el peso de la arista si está habilitado
                    if (this.showWeights) {
                        this.dibujarPesoArista(pos1, pos2, this.matrizCostos[i][j]);
                    }
                }
            }
        }
        
        // Resetear sombras
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }
    
    dibujarPesoArista(pos1, pos2, distancia) {
        const medioX = (pos1.x + pos2.x) / 2;
        const medioY = (pos1.y + pos2.y) / 2;
        
        // Fondo del texto
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(medioX - 15, medioY - 8, 30, 16);
        
        // Borde
        this.ctx.strokeStyle = '#00CED1';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(medioX - 15, medioY - 8, 30, 16);
        
        // Texto
        this.ctx.fillStyle = '#00CED1';
        this.ctx.fillText(`${distancia}km`, medioX, medioY);
    }
    
    dibujarNodos(posiciones, ruta, radio) {
        for (const lugar in posiciones) {
            const pos = posiciones[lugar];
            
            // Determinar el color del nodo
            let color = '#1a1a1a';
            let borderColor = '#00CED1';
            let shadowColor = 'transparent';
            
            if (ruta && ruta.includes(lugar)) {
                if (ruta[0] === lugar) { // Nodo de inicio
                    color = '#32CD32'; // Verde lima
                    borderColor = '#32CD32';
                } else if (ruta[ruta.length - 1] === lugar) { // Nodo final
                    color = '#8A2BE2'; // Violeta
                    borderColor = '#8A2BE2';
                } else { // Nodos intermedios
                    color = '#00CED1'; // Turquesa
                    borderColor = '#00CED1';
                }
                shadowColor = color;
            }
            
            // Sombra para nodos de la ruta
            this.ctx.shadowColor = shadowColor;
            this.ctx.shadowBlur = 15;
            
            // Dibujar el círculo del nodo
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, radio, 0, 2 * Math.PI);
            this.ctx.fill();
            
            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Resetear sombra
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            
            // Dibujar el texto del nodo
            this.ctx.fillStyle = '#f8f9fa';
            this.ctx.font = 'bold 14px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
            this.ctx.fillText(lugar, pos.x, pos.y);
        }
    }
    
    dibujarTitulo() {
        this.ctx.font = '16px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        this.ctx.fillStyle = '#00CED1';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Sistema de Rutas', this.canvas.width / 2, 30);
        
        // Subtítulo
        this.ctx.font = '12px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        this.ctx.fillStyle = '#a0a0a0';
        this.ctx.fillText('Nodo A: Centro | Rutas optimizadas para múltiples nodos intermedios', this.canvas.width / 2, 50);
    }
    
    esAristaEnRuta(lugar1, lugar2, ruta) {
        for (let i = 0; i < ruta.length - 1; i++) {
            if ((ruta[i] === lugar1 && ruta[i+1] === lugar2) || 
                (ruta[i] === lugar2 && ruta[i+1] === lugar1)) {
                return true;
            }
        }
        return false;
    }
    
    algoritmoDijkstra(inicio, fin) {
        const n = this.lugares.length;
        const i = this.lugares.indexOf(inicio);
        const j = this.lugares.indexOf(fin);
        
        if (i === -1 || j === -1) {
            return {
                distancia: Infinity,
                camino: []
            };
        }
        
        const distancias = new Array(n).fill(Infinity);
        const anterior = new Array(n).fill(-1);
        const sinVisitar = new Set(Array.from({length: n}, (_, idx) => idx));
        
        distancias[i] = 0;
        
        while (sinVisitar.size > 0) {
            // Encontrar el nodo con la distancia mínima
            let actual = -1;
            let minDist = Infinity;
            
            for (const nodo of sinVisitar) {
                if (distancias[nodo] < minDist) {
                    minDist = distancias[nodo];
                    actual = nodo;
                }
            }
            
            if (actual === -1) break;
            
            sinVisitar.delete(actual);
            
            if (actual === j) break;
            
            // Actualizar distancias a los vecinos
            for (let vecino = 0; vecino < n; vecino++) {
                if (this.matrizAdy[actual][vecino] === 1 && sinVisitar.has(vecino)) {
                    const nuevaDist = distancias[actual] + this.matrizCostos[actual][vecino];
                    if (nuevaDist < distancias[vecino]) {
                        distancias[vecino] = nuevaDist;
                        anterior[vecino] = actual;
                    }
                }
            }
        }
        
        // Reconstruir el camino
        const camino = [];
        let actual = j;
        
        if (anterior[actual] !== -1 || actual === i) {
            while (actual !== -1) {
                camino.unshift(this.lugares[actual]);
                actual = anterior[actual];
            }
        }
        
        return {
            distancia: distancias[j],
            camino: camino
        };
    }
    
    algoritmoFloyd(inicio, fin) {
        const n = this.lugares.length;
        const i = this.lugares.indexOf(inicio);
        const j = this.lugares.indexOf(fin);
        
        if (i === -1 || j === -1) {
            return {
                distancia: Infinity,
                camino: []
            };
        }
        
        // Crear matrices de distancia y siguiente
        const dist = [];
        const siguiente = [];
        
        for (let a = 0; a < n; a++) {
            dist[a] = [...this.matrizCostos[a]];
            siguiente[a] = new Array(n).fill(-1);
            
            for (let b = 0; b < n; b++) {
                if (a !== b && dist[a][b] !== Infinity) {
                    siguiente[a][b] = b;
                }
            }
        }
        
        // Algoritmo de Floyd-Warshall
        for (let k = 0; k < n; k++) {
            for (let a = 0; a < n; a++) {
                for (let b = 0; b < n; b++) {
                    if (dist[a][b] > dist[a][k] + dist[k][b]) {
                        dist[a][b] = dist[a][k] + dist[k][b];
                        siguiente[a][b] = siguiente[a][k];
                    }
                }
            }
        }
        
        // Reconstruir el camino
        const camino = [];
        if (siguiente[i][j] === -1) {
            return {
                distancia: Infinity,
                camino: []
            };
        }
        
        let actual = i;
        camino.push(this.lugares[actual]);
        
        while (actual !== j) {
            actual = siguiente[actual][j];
            camino.push(this.lugares[actual]);
        }
        
        return {
            distancia: dist[i][j],
            camino: camino
        };
    }
    
    buscarRuta() {
        const inicio = this.originSelect.value;
        const fin = this.destinationSelect.value;
        
        if (!inicio || !fin) {
            alert("Debes elegir un inicio y un destino.");
            return;
        }
        
        if (inicio === fin) {
            alert("El inicio y destino son el mismo.");
            return;
        }
        
        // Mostrar estado de carga
        this.dijkstraResult.textContent = "Calculando...";
        this.floydResult.textContent = "Calculando...";
        this.routeResult.textContent = "Procesando ruta...";
        
        // Pequeño delay para que se vea el estado de carga
        setTimeout(() => {
            const resultadoDijkstra = this.algoritmoDijkstra(inicio, fin);
            const resultadoFloyd = this.algoritmoFloyd(inicio, fin);
            
            if (resultadoDijkstra.distancia === Infinity) {
                this.dijkstraResult.textContent = "Sin conexión";
                this.floydResult.textContent = "Sin conexión";
                this.routeResult.textContent = "No hay ruta disponible";
                this.dibujarMapa();
                alert("No hay camino entre estos lugares.");
            } else {
                this.dijkstraResult.textContent = `Distancia: ${resultadoDijkstra.distancia.toFixed(2)} km`;
                this.floydResult.textContent = `Distancia: ${resultadoFloyd.distancia.toFixed(2)} km`;
                this.routeResult.textContent = resultadoDijkstra.camino.join(" → ");
                
                // Mostrar información sobre la ruta
                const numNodosIntermedios = resultadoDijkstra.camino.length - 2;
                if (numNodosIntermedios > 0) {
                    console.log(`Ruta de ${inicio} a ${fin}: pasa por ${numNodosIntermedios} nodos intermedios`);
                }
                
                this.dibujarMapa(resultadoDijkstra.camino);
            }
        }, 100);
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new AppRutas();
});