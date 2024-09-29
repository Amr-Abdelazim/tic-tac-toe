function GameBoard() {
  board = [];
  const width = 3;
  const hight = 3;
  for (let i = 0; i < hight; i++) {
    board[i] = [];
    for (let j = 0; j < width; j++) {
      board[i][j] = "";
    }
  }
  function invert_mark(mark) {
    if (mark === "X") return "O";
    return "X";
  }
  function set_board(new_board) {
    for (let i = 0; i < hight; i++) {
      for (let j = 0; j < width; j++) {
        board[i][j] = new_board[i][j];
      }
    }
  }
  function clear() {
    for (let i = 0; i < hight; i++) {
      for (let j = 0; j < width; j++) {
        board[i][j] = "";
      }
    }
  }
  const get_board = () => board;
  function valid_cell(x, y) {
    if (x >= 0 && x < hight && y >= 0 && y < width && board[x][y].length === 0)
      return true;
    return false;
  }
  function set_cell(x, y, mark) {
    if (!valid_cell(x, y)) return false;
    board[x][y] = mark;
    return true;
  }

  function check_tie() {
    for (let i = 0; i < hight; i++) {
      for (let j = 0; j < width; j++) {
        if (board[i][j] === "") {
          return false;
        }
      }
    }
    return true;
  }

  function check_win() {
    let wining_state = false;
    for (let i = 0; i < hight; i++) {
      let horizontal_line = true;
      for (let j = 1; j < width; j++) {
        if (board[i][j].length === 0 || board[i][j] != board[i][j - 1])
          horizontal_line = false;
      }
      if (horizontal_line) {
        wining_state = true;
        break;
      }
    }
    for (let j = 0; j < width; j++) {
      let vertical_line = true;
      for (let i = 1; i < hight; i++) {
        if (board[i][j].length === 0 || board[i][j] != board[i - 1][j])
          vertical_line = false;
      }
      if (vertical_line) {
        wining_state = true;
        break;
      }
    }
    let diagonal_line = true;
    for (let i = 1; i < width; i++) {
      if (board[i][i].length === 0 || board[i][i] != board[i - 1][i - 1])
        diagonal_line = false;
    }
    if (diagonal_line) {
      wining_state = true;
    }

    diagonal_line = true;
    for (let i = 1, j = width - 2; i < hight && j >= 0; i++, j--) {
      if (board[i][j].length === 0 || board[i][j] != board[i - 1][j + 1])
        diagonal_line = false;
    }
    if (diagonal_line) {
      wining_state = true;
    }
    return wining_state;
  }
  return {
    get_board,
    set_cell,
    check_win,
    check_tie,
    set_board,
    invert_mark,
    clear,
  };
}

function create_human_player(name, mark) {
  function play_turn(action_listener) {
    const chosen_cell = action_listener.getPlayerAction();
    return chosen_cell;
  }
  return { name, mark, play_turn };
}

function create_AI_player(name, mark, difficulty = "medium") {
  let dp = new Array(20000);
  for (let i = 0; i < dp.length; i++) dp[i] = -1;
  function create_mask(a) {
    let mask = 0;
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a[i].length; j++) {
        if (a[i][j] === mark) mask += 3 ** (i * a[i].length + j);
        else if (a[i][j] != "") mask += 3 ** (i * a[i].length + j) * 2;
      }
    }
    return mask;
  }
  function turns_senario(a, current_mark = 1) {
    if (a.check_win()) {
      // winning state
      return 0;
    }
    if (a.check_tie()) {
      // tie state
      return 1;
    }
    let mask = create_mask(a.get_board());
    let board = a.get_board();
    let cur_mark = current_mark === 1 ? mark : a.invert_mark(mark);
    if (dp[mask] != -1) return dp[mask];
    dp[mask] = 0; // losing state
    let tie = false;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (a.set_cell(i, j, cur_mark)) {
          let ans = turns_senario(a, current_mark ^ 1);
          board[i][j] = "";
          if (ans === 1) tie = true;
          if (ans === 0) {
            dp[mask] = 2;
            break;
          }
        }
      }
      if (dp[mask] === 2) {
        break;
      }
    }
    if (dp[mask] === 0 && tie) dp[mask] = 1;
    return dp[mask];
  }
  function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function play_turn_easy(board) {
    let availableMoves = [];
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === "") {
          availableMoves.push({ row: i, column: j });
        }
      }
    }
    return availableMoves[getRandomInRange(0, availableMoves.length - 1)];
  }

  function play_turn_medium(board) {
    let a = GameBoard();
    a.set_board(board.slice());

    let winningMove = null;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (a.set_cell(i, j, mark)) {
          if (a.check_win()) {
            winningMove = { row: i, column: j };
          }
          a.get_board()[i][j] = "";
        }
      }
    }

    if (winningMove) return winningMove;

    let blockingMove = null;
    const opponentMark = a.invert_mark(mark);
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (a.set_cell(i, j, opponentMark)) {
          if (a.check_win()) {
            blockingMove = { row: i, column: j };
          }
          a.get_board()[i][j] = "";
        }
      }
    }

    if (blockingMove) return blockingMove;

    return play_turn_easy(board);
  }

  function play_turn_hard(board) {
    let a = GameBoard();
    a.set_board(board);
    board = a.get_board();
    let best_moves = [];
    let tie = [];
    let lose = { row: -1, column: -1 };
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (a.set_cell(i, j, mark)) {
          lose = { row: i, column: j };
          let ans = turns_senario(a, 0);
          board[i][j] = "";
          if (ans === 1) {
            tie.push({ row: i, column: j });
          }
          if (ans === 0) {
            best_moves.push({ row: i, column: j });
          }
        }
      }
    }
    if (best_moves.length !== 0) {
      return best_moves[getRandomInRange(0, best_moves.length - 1)];
    }
    if (tie.length !== 0) {
      return tie[getRandomInRange(0, tie.length - 1)];
    }
    return lose;
  }

  function play_turn(board) {
    switch (difficulty) {
      case "easy":
        return play_turn_easy(board);
      case "medium":
        return play_turn_medium(board);
      case "hard":
        return play_turn_hard(board);
      default:
        return play_turn_medium(board);
    }
  }
  return { name, mark, play_turn };
}

function GameController(ui_controller) {
  let players = [];
  let current_player;
  let game_board = GameBoard();
  ui_controller.update_screen(game_board.get_board());
  function set_players(player1, player2) {
    players = [player1, player2];
    current_player = player1;
  }
  function change_turn() {
    if (current_player.mark === players[0].mark) current_player = players[1];
    else current_player = players[0];
  }

  function stop() {
    game_board.clear();
    ui_controller.update_screen(game_board.get_board());
  }

  async function play() {
    while (game_board.check_win() === false) {
      if (game_board.check_tie()) {
        return { winning_status: false };
      }
      let turn;
      do {
        console.log("hi before");
        if (current_player.name === "AI")
          turn = await current_player.play_turn(game_board.get_board().slice());
        // if AI player he will need the board for analysis
        else
          turn = await current_player.play_turn(ui_controller.action_listener); // if human player he will need the UI
        console.log("hi after");
        if (ui_controller.get_re_start()) {
          stop();
          return "Game stoped!";
        }
      } while (
        !game_board.set_cell(turn.row, turn.column, current_player.mark)
      );
      ui_controller.update_screen(game_board.get_board());
      change_turn();
    }
    change_turn();
    return { winning_status: true, player: current_player };
  }
  return { play, set_players, stop };
}

function UiController() {
  let X_configuration = { player_type: "human", difficulty: "disabled" };
  let O_configuration = { player_type: "AI", difficulty: "medium" };
  let re_start = false;
  const get_re_start = () => re_start;
  const set_re_start = (val) => (re_start = val);
  function get_configuration() {
    return { X_configuration, O_configuration };
  }
  function set_re_start_listener() {
    const re_start_btn = document.querySelector(".re-start-btn");
    re_start_btn.addEventListener("click", (event) => {
      re_start = true;
      triggerClick(0, 0);
    });
  }

  function showWinPage(message) {
    document.querySelector(".winPage").classList.remove("hidden");
    const h1 = document.querySelector(".winPage h1");
    h1.textContent = message;
    if (message.length > 3) {
      if (message[message.length - 1] === "O") {
        h1.style.color = "blue";
      } else {
        h1.style.color = "red";
      }
    } else {
      h1.style.color = "white";
    }
  }

  function ui_init() {
    const X_human_btn = document.querySelector(".X-human-btn");
    const O_human_btn = document.querySelector(".O-human-btn");
    const X_AI_btn = document.querySelector(".X-AI-btn");
    const O_AI_btn = document.querySelector(".O-AI-btn");
    const X_select = document.querySelector("#X-difficulty");
    const O_select = document.querySelector("#O-difficulty");
    set_re_start_listener();
    X_human_btn.addEventListener("click", (e) => {
      X_configuration.player_type = "human";
      X_human_btn.classList.add("btn-clicked");
      X_AI_btn.classList.remove("btn-clicked");
      X_select.disabled = true;
    });
    X_AI_btn.addEventListener("click", (e) => {
      X_configuration.player_type = "AI";
      X_configuration.difficulty = X_select.value;
      X_AI_btn.classList.add("btn-clicked");
      X_human_btn.classList.remove("btn-clicked");
      X_select.disabled = false;
    });

    O_human_btn.addEventListener("click", (e) => {
      O_configuration.player_type = "human";
      O_human_btn.classList.add("btn-clicked");
      O_AI_btn.classList.remove("btn-clicked");
      O_select.disabled = true;
    });
    O_AI_btn.addEventListener("click", (e) => {
      O_configuration.player_type = "AI";
      O_configuration.difficulty = O_select.value;
      O_AI_btn.classList.add("btn-clicked");
      O_human_btn.classList.remove("btn-clicked");
      O_select.disabled = false;
    });
    document.querySelector(".winPage").addEventListener("click", function () {
      document.querySelector(".winPage").classList.add("hidden");
    });

    X_select.addEventListener("change", (event) => {
      X_configuration.difficulty = event.target.value;
    });
    O_select.addEventListener("change", (event) => {
      O_configuration.difficulty = event.target.value;
    });
    X_human_btn.classList.add("btn-clicked");
    O_AI_btn.classList.add("btn-clicked");

    X_select.value = "medium";
    X_select.disabled = true;
    O_select.value = "medium";
    O_select.disabled = false;
  }

  function triggerClick(row, column) {
    const div_container = document.querySelector(".grid_container");
    const button = div_container.querySelector(
      `button.cell[data-row="${row}"][data-column="${column}"]`
    );
    if (button) {
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      button.dispatchEvent(clickEvent);
    }
  }

  function update_screen(game_board) {
    const div_container = document.querySelector(".grid_container");
    div_container.innerHTML = "";
    const btn_color = { X: "#9a0008", O: "#0f189a", "": "" };
    for (let i = 0; i < game_board.length; i++) {
      for (let j = 0; j < game_board[i].length; j++) {
        const btn_cell = document.createElement("button");
        btn_cell.dataset.row = i;
        btn_cell.dataset.column = j;
        btn_cell.textContent = game_board[i][j];
        btn_cell.style.backgroundColor = btn_color[game_board[i][j]];
        btn_cell.classList.add("cell");
        div_container.appendChild(btn_cell);
      }
    }
  }

  const action_listener = {
    get_re_start_action() {
      return new Promise((resolve) => {
        const re_start_btn = document.querySelector(".re-start-btn");
        re_start_btn.addEventListener("click", (event) => {
          resolve(true);
        });
      });
    },
    getPlayerAction() {
      return new Promise((resolve) => {
        const div_container = document.querySelector(".grid_container");
        div_container.addEventListener(
          "click",
          (event) => {
            if (event.target && event.target.matches("button.cell")) {
              const column = event.target.dataset.column;
              const row = event.target.dataset.row;
              resolve({ row, column });
              div_container.removeEventListener(
                "click",
                this.grid_event_handler
              );
            }
          },
          {
            once: true,
          }
        );
      });
    },
  };
  return {
    action_listener,
    update_screen,
    ui_init,
    get_configuration,
    triggerClick,
    get_re_start,
    set_re_start,
    set_re_start_listener,
    showWinPage,
  };
}
const ui_controller = UiController();
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function run_app() {
  ui_controller.ui_init();
  while (true) {
    ui_controller.set_re_start(false);
    const game = GameController(ui_controller);
    const ui_configuration = ui_controller.get_configuration();
    const player1 =
      ui_configuration.X_configuration.player_type === "AI"
        ? create_AI_player(
            "AI",
            "X",
            ui_configuration.X_configuration.difficulty
          )
        : create_human_player("human", "X");
    const player2 =
      ui_configuration.O_configuration.player_type === "AI"
        ? create_AI_player(
            "AI",
            "O",
            ui_configuration.O_configuration.difficulty
          )
        : create_human_player("human", "O");

    game.set_players(player1, player2);

    const game_result = await game.play();

    if (game_result === "Game stoped!") {
      continue;
    }
    setTimeout(() => {
      if (game_result.winning_status) {
        ui_controller.showWinPage(`The winner is ${game_result.player.mark}`);
      } else {
        ui_controller.showWinPage("Tie");
      }
    }, 2);
    await ui_controller.action_listener.get_re_start_action();
  }
}
run_app();
