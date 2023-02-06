let id = 0;
export class Dep {
  //每个属性都分配一个dep，dep可以存放watcher，watcher存放这个dep
  constructor() {
    this.id = id++;
    this.subs = [];
  }
  depend() {
    //把dep也给watch，自己把自己存进去了
    if (Dep.target) {
      //watcher存放dep
      Dep.target.addDep(this);
    }
  }
  addSub(watcher) {
    this.subs.push(watcher);
  }
  notify() {
    this.subs.forEach((watcher) => watcher.update());
  }
}
Dep.target = null;

export function pushTarget(watcher) {
  Dep.target = watcher;
}
export function popTarget() {
  Dep.target = null;
}
