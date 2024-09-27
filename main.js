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
  return { get_board, set_cell, check_win, check_tie };
}

function create_human_player(name, mark) {
  const action_listener = UiController().action_listener;
  function play_turn() {
    const chosen_cell = action_listener.getPlayerAction();
    return chosen_cell;
  }
  return { name, mark, play_turn };
}
function create_AI_player(name, mark) {
  function play_turn() {}
  return { name, mark, play_turn };
}

function GameController() {
  let players = [];
  let current_player;
  let game_board = GameBoard();
  const ui_controller = UiController();
  ui_controller.update_screen(game_board.get_board());
  function set_players(player1, player2) {
    players = [player1, player2];
    current_player = player1;
  }
  function change_turn() {
    if (current_player === players[0]) current_player = players[1];
    else current_player = players[0];
  }
  async function play() {
    while (game_board.check_win() === false) {
      let turn;
      do {
        turn = await current_player.play_turn();
      } while (
        !game_board.set_cell(turn.row, turn.column, current_player.mark)
      );
      ui_controller.update_screen(game_board.get_board());
      change_turn();
      if (game_board.check_tie()) {
        return { winning_status: false };
      }
    }
    change_turn();
    return { winning_status: true, player: current_player };
  }
  return { play, set_players };
}

function UiController() {
  function update_screen(game_board) {
    const div_container = document.querySelector(".grid_container");
    div_container.innerHTML = "";
    for (let i = 0; i < game_board.length; i++) {
      for (let j = 0; j < game_board[i].length; j++) {
        const btn_cell = document.createElement("button");
        btn_cell.dataset.row = i;
        btn_cell.dataset.column = j;
        btn_cell.textContent = game_board[i][j];
        btn_cell.classList.add("cell");
        div_container.appendChild(btn_cell);
      }
    }
  }

  const action_listener = {
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
            }
          },
          { once: true }
        );
      });
    },
  };
  return { action_listener, update_screen };
}
async function app() {
  const game = GameController();
  game.set_players(
    create_human_player("amr", "X"),
    create_human_player("ali", "O")
  );
  const game_result = await game.play();
  if (game_result.winning_status) {
    alert(`The winner is ${game_result.player.mark}`);
  } else {
    alert("Tie");
  }
}
app();
