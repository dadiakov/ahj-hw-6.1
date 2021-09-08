/* eslint-disable linebreak-style */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */

export default class CardsContainer {
  constructor(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    this.container = container;
    if (localStorage.getItem('cards-container')) {
      this.container.innerHTML = JSON.parse(localStorage.getItem('cards-container'));
    }
    this.activeDragElement = undefined;
    this.activeDragElementWidth = 0;

    this.addListeners(this.container);
    this.onDrag = this.onDrag.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.addCard = this.addCard.bind(this);
  }

  showInputField(parentElement) {
    parentElement.querySelector('.textarea-field').classList.remove('hide');
  }

  addListeners(container) {
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-new-tag') || e.target.closest('.add-new-tag')) {
        this.addButtonClick(e);
      }
      if (e.target.classList.contains('button-add-card-remove')) {
        this.removeButtonClick(e);
      }
      if (e.target.classList.contains('close-cross')) {
        e.target.closest('.card').remove();
        this.saveToLS();
      }
      if (e.target.classList.contains('button-add-card')) {
        const { value } = e.target.closest('.textarea-field').querySelector('.textarea');
        this.addNewTag(e.target.closest('.table-cell').querySelector('.cards'), value);
      }
    });
    container.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('card')) this.onDragStart(e);
    });
  }

  addNewTag(parentElem, value) {
    if (!value) return;
    const closeDiv = document.createElement('div');
    closeDiv.className = 'close-cross hide';
    const outerDiv = document.createElement('div');
    outerDiv.className = 'card';
    outerDiv.textContent = value;
    outerDiv.appendChild(closeDiv);
    parentElem.appendChild(outerDiv);

    parentElem.closest('.table-cell').querySelector('.textarea').value = '';
    parentElem.closest('.table-cell').querySelector('.textarea-field').classList.add('hide');
    parentElem.closest('.table-cell').querySelector('.add-new-tag').classList.remove('hide');

    this.saveToLS();
  }

  addButtonClick(e) {
    e.target.closest('.table-cell').querySelector('.textarea-field').classList.remove('hide');
    e.target.closest('.table-cell').querySelector('.add-new-tag').classList.add('hide');
  }

  removeButtonClick(e) {
    e.target.closest('.textarea-field').classList.add('hide');
    e.target.closest('.table-cell').querySelector('.add-new-tag').classList.remove('hide');
  }

  onDragStart(e) {
    e.preventDefault();
    if (!e.target.classList.contains('card')) return;
    document.body.style.cursor = 'grabbing';
    const { target } = e;
    this.activeDragElement = target;
    this.activeDragElementWidth = target.offsetWidth;
    this.elementLeft = e.clientX - this.activeDragElement.getBoundingClientRect().x;
    this.elementTop = e.clientY - this.activeDragElement.getBoundingClientRect().y;

    this.activeDragElement.classList.add('dragged');

    const newElem = document.createElement('div');
    newElem.style.width = '100%';
    newElem.style.height = `${this.activeDragElement.offsetHeight}px`;
    newElem.style.backgroundColor = '#e9e7e7';
    newElem.className = 'card ghost';
    this.activeDragElement.closest('.cards').appendChild(newElem);

    this.activeDragElement.closest('.cards').insertBefore(newElem, this.activeDragElement);

    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.onDragEnd);

    this.onDrag(e);
  }

  onDrag(e) {
    e.preventDefault();

    if (!this.activeDragElement) {
      return;
    }

    this.activeDragElement.style.top = `${e.clientY - this.elementTop + window.scrollY}px`;
    this.activeDragElement.style.left = `${e.clientX - this.elementLeft + window.scrollX}px`;
    this.activeDragElement.style.width = `${this.activeDragElementWidth}px`;

    this.addGhost(e);
  }

  onDragEnd(e) {
    document.body.style.cursor = 'auto';
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.onDragEnd);

    this.activeDragElement.style.width = '100%';
    this.activeDragElement.style.top = 0;
    this.activeDragElement.style.left = 0;

    this.addCard(e);

    this.activeDragElement = undefined;
    if (document.querySelector('.ghost1')) {
      document.querySelectorAll('.ghost1').forEach((e) => e.remove());
    }
    if (document.querySelector('.ghost')) {
      document.querySelectorAll('.ghost').forEach((e) => e.remove());
    }
    this.saveToLS();
  }

  addCard(e) {
    const targetElement = document.elementFromPoint(e.clientX, e.clientY);

    if (!targetElement.classList.contains('card') && targetElement.closest('.cards')) {
      return;
    }

    if (targetElement.classList.contains('card')) {
      const { top } = targetElement.getBoundingClientRect();
      if (e.pageY > window.scrollY + top + targetElement.offsetHeight / 2) {
        targetElement.closest('.cards').insertBefore(this.activeDragElement, targetElement.nextElementSibling);
      } else {
        targetElement.closest('.cards').insertBefore(this.activeDragElement, targetElement);
      }
    }

    if (!targetElement.classList.contains('card') && !targetElement.closest('.cards') && targetElement.closest('.table-cell')) {
      targetElement.closest('.table-cell').querySelector('.cards').appendChild(this.activeDragElement);
    }

    this.activeDragElement.classList.remove('dragged');
    this.activeDragElement = undefined;
    document.querySelector('.ghost').remove();

    this.saveToLS();
  }

  addGhost(e) {
    if (document.querySelector('.ghost1')) document.querySelector('.ghost1').remove();
    const targetElement = document.elementFromPoint(e.clientX, e.clientY);
    if (targetElement.classList.contains('ghost')) return;
    const newElem = document.createElement('div');
    newElem.style.width = '100%';
    newElem.style.height = `${this.activeDragElement.offsetHeight}px`;
    newElem.style.backgroundColor = '#e9e7e7';
    newElem.style.border = '1px dashed red';
    newElem.className = 'card ghost1';

    if (!targetElement.classList.contains('card') && targetElement.closest('.cards')) {
      return;
    }

    if (targetElement.classList.contains('card')) {
      const { top } = targetElement.getBoundingClientRect();
      if (e.pageY > window.scrollY + top + targetElement.offsetHeight / 2) {
        targetElement.closest('.cards').insertBefore(newElem, targetElement.nextElementSibling);
      } else {
        targetElement.closest('.cards').insertBefore(newElem, targetElement);
      }
    }

    if (!targetElement.classList.contains('card') && !targetElement.closest('.cards') && targetElement.closest('.table-cell')) {
      targetElement.closest('.table-cell').querySelector('.cards').appendChild(newElem);
    }
  }

  saveToLS() {
    localStorage.setItem('cards-container', JSON.stringify(this.container.innerHTML));
  }
}
