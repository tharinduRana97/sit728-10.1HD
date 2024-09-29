const TodoList = artifacts.require("./TodoList.sol");

contract("TodoList", (accounts) => {
  let todoList;

  before(async () => {
    todoList = await TodoList.deployed();
  });

  it("deploys successfully", async () => {
    const address = await todoList.address;
    assert.notEqual(address, 0x0);
    assert.notEqual(address, "");
    assert.notEqual(address, null);
    assert.notEqual(address, undefined);
  });

  it("lists tasks", async () => {
    const taskCount = await todoList.taskCount();
    const task = await todoList.tasks(taskCount);
    assert.equal(task.id.toNumber(), taskCount.toNumber());
    assert.equal(task.content, "Check out dappuniversity.com");
    assert.equal(task.completed, false);
    assert.equal(task.assignedTo, accounts[0]);
    assert.equal(task.priority, false);
    assert.equal(task.deadline, "None");
    assert.equal(task.category, "Work");
    assert.equal(taskCount.toNumber(), 1);
  });

  it("creates tasks", async () => {
    const result = await todoList.createTask(
      "A new task",
      accounts[1], // updated to use accounts from the test environment
      "2024-09-27 12:00",
      "Work",
      true
    );
    const taskCount = await todoList.taskCount();
    assert.equal(taskCount.toNumber(), 2);
    const event = result.logs[0].args;
    assert.equal(event.id.toNumber(), 2);
    assert.equal(event.content, "A new task");
    assert.equal(event.completed, false);
    assert.equal(event.assignedTo, accounts[1]);
    assert.equal(event.priority, true);
    assert.equal(event.deadline, "2024-09-27 12:00");
    assert.equal(event.category, "Work");
  });

  it("updates tasks", async () => {
    await todoList.updateTask(
      2,
      "Updated task content",
      accounts[2],
      "2024-09-28 12:00",
      "Personal",
      false
    );
    const task = await todoList.tasks(2);
    assert.equal(task.content, "Updated task content");
    assert.equal(task.assignedTo, accounts[2]);
    assert.equal(task.deadline, "2024-09-28 12:00");
    assert.equal(task.category, "Personal");
    assert.equal(task.priority, false);
  });

  it("toggles task completion", async () => {
    const result = await todoList.toggleCompleted(1);
    const task = await todoList.tasks(1);
    assert.equal(task.completed, true);
    const event = result.logs[0].args;
    assert.equal(event.id.toNumber(), 1);
    assert.equal(event.completed, true);
  });

  it("toggles task completion back to incomplete", async () => {
    const result = await todoList.toggleCompleted(1);
    const task = await todoList.tasks(1);
    assert.equal(task.completed, false);
    const event = result.logs[0].args;
    assert.equal(event.id.toNumber(), 1);
    assert.equal(event.completed, false);
  });
});
