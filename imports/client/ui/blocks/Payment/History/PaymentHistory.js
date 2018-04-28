import { BlazeComponent } from 'meteor/peerlibrary:blaze-components';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import { Notifications } from '/moduls/game/lib/importCompability';
import { $ } from 'meteor/jquery';
import Game from '/moduls/game/lib/main.game';
import '/imports/client/ui/Tabs/Tabs';
import '/imports/client/ui/blocks/Paging/Paging';
import './PaymentHistory.html';
import './PaymentHistory.styl';

class PaymentHistory extends BlazeComponent {
  template() {
    return 'PaymentHistory';
  }

  constructor(type) {
    super();

    this.isIncome = new ReactiveVar(true);
    if (type === 'spend') this.isIncome.set(false);

    this.history = new ReactiveVar(null);
    this.isLoading = new ReactiveVar(true);
    this.currentPage = new ReactiveVar(1);
    this.pagesTotal = new ReactiveVar();

    this.itemsOnPage = 15;
    this.paymentTypes = {
      chatFree: 'Не платить за ссаный чат',
      chatBalance: 'Пополнение баланса комнаты в чате',
      chatIcon: 'Покупка иконки для чата',
      planetRename: 'Переименование планеты',
      planetBuy: 'Покупка дополнительной колонии',
      card: 'Покупка карточки',
      unitBuild: 'Покупка юнитов',
      mutualInvest: 'Вложение в общие исследования',
      building: 'Постройка здания',
      researchStart: 'Покупка исследования',
      houseItem: 'Покупка предмета в палате',
      container: 'Покупка контейнера',
      sepukku: 'Сэппуку',
      personSkin: 'Покупка скина персонажа',
      buildingSpeedup: 'Ускорение строительства',
      unitSpeedup: 'Ускорение постройки юнитов',
      researchSpeedup: 'Ускорение исследования',
    };

    this.tabs = new ReactiveVar([
      {
        id: 'income',
        name: 'История пополнений',
        isActive: true,
      },
      {
        id: 'spend',
        name: 'История расходов',
      },
    ]);
  }

  onCreated() {
    super.onCreated();

    this.autorun(() => {
      this.switchType();
      this.getHistory(this.currentPage.get());
    });
  }

  onRendered() {
    super.onRendered();

    $('.cw--PaymentHistory__data').perfectScrollbar();
  }

  setTotalPages() {
    let itemsTotal;
    if (this.isIncome.get()) {
      itemsTotal = Game.Statistic.getUserValue('payment.income');
    } else {
      itemsTotal = Game.Statistic.getUserValue('payment.expense');
    }
    this.pagesTotal.set(Math.ceil(itemsTotal / this.itemsOnPage));
  }

  formatDate(timestamp) {
    const date = new Date((timestamp - (new Date().getTimezoneOffset() * 60)) * 1000);
    const day = [
      `0${date.getUTCDate()}`.slice(-2),
      `0${date.getUTCMonth() + 1}`.slice(-2),
      date.getUTCFullYear(),
    ].join('.');

    return day;
  }

  setHistory(historyData) {
    const data = [];
    let lastDate = '';

    historyData.forEach((item) => {
      const historyItem = {
        credits: item.credits || 0,
      };

      const time = item.timestamp || item.timeUpdated;
      if (lastDate !== this.formatDate(time)) {
        lastDate = this.formatDate(time);
        historyItem.date = lastDate;
      }

      if (item.type) {
        historyItem.goal = this.paymentTypes[item.type];
      }
      if (item.items && item.items.length > 1) {
        historyItem.goalTimes = item.items.length;
      }

      if (item.source) {
        if (item.source.type === 'payment') {
          historyItem.goal = `Покупка: ${item.source.item}`;
        } else if (item.source.type === 'promo') {
          historyItem.goal = `Промокод: ${item.source.code}`;
        }
      }
      if (item.profit) {
        historyItem.profit = item.profit;
      }

      data.push(historyItem);
    });

    this.setTotalPages();
    this.history.set(data);
  }

  getHistory(page = 1, count = this.itemsOnPage) {
    this.isLoading.set(true);

    let methodName = 'user.getPaymentIncomeHistory';
    if (!this.isIncome.get()) {
      methodName = 'user.getPaymentExpenseHistory';
    }

    Meteor.call(methodName, page, count, (err, data) => {
      this.isLoading.set(false);
      if (err) {
        Notifications.error('Не удалось загрузить историю', err.error);
      } else {
        if (data.length < count && data.length !== 0) {
          this.pagesTotal.set(this.currentPage.get());
        } else if (data.length === 0) {
          this.getHistory(this.currentPage.get() - 1);
          this.pagesTotal.set(this.currentPage.get() - 1);
        }
        this.setHistory(data);
        $('.cw--PaymentHistory__data').perfectScrollbar('update');
      }
    });
  }

  switchType() {
    let tabId = '';
    this.tabs.get().forEach((tabItem) => {
      if (tabItem.isActive) {
        tabId = tabItem.id;
      }
    });

    const currentType = this.isIncome.get() ? 'income' : 'spend';
    if (currentType !== tabId) {
      this.currentPage.set(1);
    }

    if (tabId === 'income') {
      this.isIncome.set(true);
    } else {
      this.isIncome.set(false);
    }

  }
}

PaymentHistory.register('PaymentHistory');

export default PaymentHistory;
