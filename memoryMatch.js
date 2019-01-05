class MemoryMatch {

	constructor(baseElement, cards) {
		this.baseEl = baseElement;
		this.uniqueCards = Array.isArray(cards) ? Object.assign({}, cards) : cards;
		this.cardsTotal = Object.keys(this.uniqueCards).length;
		this.gridCols = Math.ceil(Math.sqrt(this.cardsTotal * 2));
		this.gridRows = Math.ceil((this.cardsTotal * 2) / this.gridCols);
		
		this.restartBtnEl = null;
		this.infoEl = null;
		this.gridEl = null;
		this.timerEl = null;
		this.cardDeck = null;
		this.selectedColEl = null;
		this.foundCards = [];
		this.blockCommands = null;
		
		this.timer = null;
		
		this.load();
	}
	
	render() {
		if (!this.gridEl) {
			this.gridEl = document.createElement('div');
			this.gridEl.classList.add('grid');
		}
		this.gridEl.innerHTML = '';
		
		let cellCounter = 0;
		for (let i = 0; i < this.gridRows; i++) {
			const gridRowEl = document.createElement('div');
			gridRowEl.classList.add('row');
			for (let j = 0; j < this.gridCols; j++) {
				if (cellCounter >= this.cardDeck.length) {
					break;
				}
				const gridColEl = document.createElement('div');
				gridColEl.classList.add('col');
				const gridCellEl = document.createElement('div');
				gridCellEl.classList.add('cell');
				gridColEl.dataset.card = this.cardDeck[cellCounter];
				gridCellEl.innerHTML = this.uniqueCards[this.cardDeck[cellCounter]];
				gridColEl.appendChild(gridCellEl);
				gridRowEl.appendChild(gridColEl);
				cellCounter += 1;
			}
			this.gridEl.appendChild(gridRowEl);
		}
		
		if (!this.restartBtnEl) {
			this.restartBtnEl = document.createElement('button');
			this.restartBtnEl.classList.add('restart-btn');
			this.restartBtnEl.innerHTML = 'Restart';
		}
		
		if (!this.infoEl) {
			this.infoEl = document.createElement('div');
			this.infoEl.classList.add('info');
			this.infoEl.innerHTML = '<span class="timer-title">Timer:</span> '
			this.timerEl = document.createElement('span');
			this.timerEl.classList.add('timer');
			this.infoEl.appendChild(this.timerEl);			
		}
		
		this.baseEl.innerHTML = '';
		this.baseEl.appendChild(this.gridEl);
		this.baseEl.appendChild(this.restartBtnEl);
		this.baseEl.appendChild(this.infoEl);
	};
		  
	load(reshuffle) {
		this.foundCards = [];
		if (!this.cardDeck || reshuffle) {
			this.cardDeck = MemoryMatch.generateCardDeck(this.uniqueCards);
		}
		
		this.render();		
		if (!this.timer && this.timerEl) {
			this.timer = new MemoryMatchTimer(this.timerEl);
		}
		this.timer.reset();
		this.handleEvents();
	};
	
	handleEvents() {
		this.restartBtnEl.addEventListener('click', (e) => {
			this.load(true);
		});
		
		const instance = this;		
		const onColClick = function(e) {
			if (instance.blockCommands || instance.foundCards.indexOf(this.dataset.card) >= 0) {
				return;
			}
			
			if (!instance.timer.isRunning()) {
				instance.timer.init();
			}
			
			const curColEl = this;
			const selColEl = instance.selectedColEl;	
			
			if (selColEl) {
				curColEl.classList.remove('selected');
				selColEl.classList.remove('selected');
				if (curColEl != selColEl) {					
					if (selColEl.dataset.card == curColEl.dataset.card) {
						instance.foundCards.push(selColEl.dataset.card);
						curColEl.classList.add('matched');
						selColEl.classList.add('matched');						
						if (instance.foundCards.length == instance.cardsTotal) {
							instance.timer.stop();
						}						
					} else {
						curColEl.classList.add('not-matched');
						selColEl.classList.add('not-matched');
						instance.gridEl.classList.add('alert');
						instance.blockCommands = true;
						setTimeout(function() {
							instance.blockCommands = false;
							curColEl.classList.remove('not-matched');
							selColEl.classList.remove('not-matched');
							instance.gridEl.classList.remove('alert');
						}, 2000);						
					}
				}
				instance.selectedColEl = null;
			} else {
				instance.selectedColEl = curColEl;
				curColEl.classList.add('selected');
			}
		};
		
		const colEls = this.gridEl.getElementsByClassName('col');
		for (let i = 0; i < colEls.length; i++) {
			colEls[i].addEventListener('click', onColClick);
		}
	};
	
	static generateCardDeck(uniqueCards) {
		let cardDeck = Object.keys(uniqueCards).reduce((res, current, index, array) => {
			return res.concat([current, current]);
		}, []);
		MemoryMatch.shuffle(cardDeck);
		return cardDeck;
	};
	
	static shuffle(array) {
		var j, x, i;
		for (i = array.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			x = array[i];
			array[i] = array[j];
			array[j] = x;
		}
		return array;
	};	
};

class MemoryMatchTimer {
	constructor(timerEl) {
		this.timerEl = timerEl;
		this.timeSec = 0;
		this.timer = null;
	};
	
	init() {
		const instance = this;
		this.timeSec = 0;
		this.timer = setInterval(function() {
			instance.timeSec += 1;
			instance.timerEl.innerHTML = instance.timeSec + ' seconds';
		}, 1000);
	};
	
	stop() {
		clearInterval(this.timer);
		this.timer = null;
	};
	
	reset() {
		this.stop();
		this.timeSec = 0;
		this.timerEl.innerHTML = this.timeSec + ' seconds';
	};
	
	isRunning() {
		return this.timer ? true : false;
	};
}