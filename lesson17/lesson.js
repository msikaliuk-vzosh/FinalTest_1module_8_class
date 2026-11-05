window.LESSON_DATA = {
  "id": "grade9-lesson17",
  "version": "grade9-lesson17-pages-1",
  "title": "Опрацювання списків: функції та методи",
  "tasks": [
    {
      "id": "p01",
      "title": "Переверни список",
      "instruction": "Створи список b з усіх елементів a у зворотному порядку.",
      "code": "a = [2, 4, 6]\nb = a[{{b0}}]",
      "fields": [
        {
          "key": "b0",
          "label": "Пропуск 1",
          "expected": "::-1",
          "options": [
            "::2",
            "::-1",
            ":",
            "::0"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Потрібен рух від кінця до початку без пропусків."
        }
      ],
      "source": "16:8–14; Задача 1_1.py",
      "points": 2
    },
    {
      "id": "p02",
      "title": "Розпізнай паліндром",
      "instruction": "Отримай істину лише тоді, коли порядок елементів не змінюється після перевертання.",
      "code": "a = [3, 5, 3]\nb = a[::-1]\nresult = {{b0}}",
      "fields": [
        {
          "key": "b0",
          "label": "Пропуск 1",
          "expected": "a == b",
          "options": [
            "a == b",
            "len(a) == len(b)",
            "a != b",
            "a = b",
            "b == a"
          ],
          "aliases": [
            "b == a"
          ],
          "kind": "pyexpr",
          "hint": "Однакової довжини недостатньо. Порівняй значення і порядок."
        }
      ],
      "source": "16:12–16; Задачі 1_1.py і 1_2.py",
      "points": 2
    },
    {
      "id": "p03",
      "title": "Зупини пошук",
      "instruction": "Якщо знайдено число строго більше за поріг x, виведи «Є» один раз. Якщо таких чисел немає, виведи «Немає».",
      "code": "a = [8, 9, 10]\nx = 8\nfor i in range(len(a)):\n    if {{b0}}:\n        print(\"Є\")\n        {{b1}}\nelse:\n    print(\"Немає\")",
      "fields": [
        {
          "key": "b0",
          "label": "Пропуск 1",
          "expected": "a[i] > x",
          "options": [
            "a[i] >= x",
            "a[i] > x",
            "a[i] => x",
            "a[i] == x",
            "x < a[i]"
          ],
          "aliases": [
            "x < a[i]"
          ],
          "kind": "pyexpr",
          "hint": "Елемент, рівний порогу, не підходить."
        },
        {
          "key": "b1",
          "label": "Пропуск 2",
          "expected": "break",
          "options": [
            "Break",
            "continue",
            "break",
            "print(i)"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Після знахідки решту елементів переглядати не потрібно."
        }
      ],
      "source": "16:20–23; Задачі 4_1.py і 4_2.py",
      "points": 2
    },
    {
      "id": "p04",
      "title": "Кількість і сума",
      "instruction": "Знайди кількість елементів списку та суму їхніх значень.",
      "code": "a = [2, 4, 6, 8, 4]\nn = {{b0}}\ns = {{b1}}",
      "fields": [
        {
          "key": "b0",
          "label": "Пропуск 1",
          "expected": "len(a)",
          "options": [
            "len[a",
            "len(a)",
            "max(a)",
            "sum(a)"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Повторене значення теж є окремим елементом."
        },
        {
          "key": "b1",
          "label": "Пропуск 2",
          "expected": "sum(a)",
          "options": [
            "sum[a",
            "len(a)",
            "sum(a)",
            "min(a)"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Додай усі значення, зокрема повтори."
        }
      ],
      "source": "17:3–4",
      "points": 2
    },
    {
      "id": "p05",
      "title": "Накопич суми",
      "instruction": "Заверши власну функцію, яка підсумовує всі числа, зокрема від’ємні. Для порожнього списку результат має бути 0.",
      "code": "def total(a):\n    s = {{b0}}\n    for x in a:\n        s = {{b1}}\n    return s",
      "fields": [
        {
          "key": "b0",
          "label": "Пропуск 1",
          "expected": "0",
          "options": [
            "1",
            "0",
            "a[0]",
            "None"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Яка сума до перегляду першого числа?"
        },
        {
          "key": "b1",
          "label": "Пропуск 2",
          "expected": "s + x",
          "options": [
            "s - x",
            "x",
            "s x",
            "x + s",
            "s + x"
          ],
          "aliases": [
            "x + s"
          ],
          "kind": "pyexpr",
          "hint": "Додай поточне число до вже накопиченого."
        }
      ],
      "source": "17:5–8",
      "points": 2
    },
    {
      "id": "p06",
      "title": "Знайди крайні значення",
      "instruction": "Запиши найменше число в low, найбільше — в high.",
      "code": "a = [-7, -2, -5]\nlow = {{b0}}\nhigh = {{b1}}",
      "fields": [
        {
          "key": "b0",
          "label": "Пропуск 1",
          "expected": "min(a)",
          "options": [
            "min(a",
            "min(a)",
            "a[0]",
            "max(a)"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Перше число випадково найменше лише в цьому прикладі. Обери загальний спосіб."
        },
        {
          "key": "b1",
          "label": "Пропуск 2",
          "expected": "max(a)",
          "options": [
            "max(a",
            "min(a)",
            "0",
            "max(a)"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Навіть коли всі числа від’ємні, найбільше має бути зі списку."
        }
      ],
      "source": "17:4,9–12",
      "points": 2
    },
    {
      "id": "p07",
      "title": "Найменше в циклі",
      "instruction": "Функція отримує непорожній список і повертає найменше число. Доповни початкове значення й умову оновлення.",
      "code": "def smallest(a):\n    m = {{b0}}\n    for i in range(1, len(a)):\n        if {{b1}}:\n            m = a[i]\n    return m",
      "fields": [
        {
          "key": "b0",
          "label": "Пропуск 1",
          "expected": "a[0]",
          "options": [
            "a[0]",
            "a[0",
            "a[-1]",
            "0"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Цикл починається з індексу 1. Який елемент він пропускає?"
        },
        {
          "key": "b1",
          "label": "Пропуск 2",
          "expected": "a[i] < m",
          "options": [
            "m > a[i]",
            "a[i] < m",
            "a[i] == m",
            "a[i] > m",
            "a[i] = m"
          ],
          "aliases": [
            "m > a[i]"
          ],
          "kind": "pyexpr",
          "hint": "Оновлюй значення, коли знайдено менше."
        }
      ],
      "source": "17:9–11",
      "points": 2
    },
    {
      "id": "p08",
      "title": "Перепад температур",
      "instruction": "Для непорожнього списку знайди різницю між найбільшою і найменшою температурою за один прохід.",
      "code": "def minimax(a):\n    low = high = a[0]\n    for i in range(1, len(a)):\n        if a[i] > high:\n            high = a[i]\n        elif {{b0}}:\n            low = a[i]\n    return {{b1}}",
      "fields": [
        {
          "key": "b0",
          "label": "Пропуск 1",
          "expected": "a[i] < low",
          "options": [
            "a[i] = low",
            "a[i] > low",
            "a[i] < low",
            "a[i] == low"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Друга гілка відповідає за новий мінімум."
        },
        {
          "key": "b1",
          "label": "Пропуск 2",
          "expected": "high - low",
          "options": [
            "high + low",
            "high low",
            "high - low",
            "low - high"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Різниця має бути невід’ємною."
        }
      ],
      "source": "17:13–16",
      "points": 2
    },
    {
      "id": "p09",
      "title": "Доповни список",
      "instruction": "Додай 9 у кінець. Потім устав 3 після першого елемента. Має вийти [2, 3, 4, 6, 9].",
      "code": "a = [2, 4, 6]\n{{b0}}\n{{b1}}",
      "fields": [
        {
          "key": "b0",
          "label": "Пропуск 1",
          "expected": "a.append(9)",
          "options": [
            "a.insert(0, 9)",
            "a.append(9)",
            "a.remove(9)",
            "a.append(9",
            "a.insert(len(a), 9)"
          ],
          "aliases": [
            "a.insert(len(a), 9)"
          ],
          "kind": "pyexpr",
          "hint": "Дев’ятка має залишитися в кінці."
        },
        {
          "key": "b1",
          "label": "Пропуск 2",
          "expected": "a.insert(1, 3)",
          "options": [
            "a.append(3)",
            "a.insert(3, 1)",
            "a.insert(1 3)",
            "a.insert(1, 3)"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Позиції нумеруються з нуля, а аргумент зі значенням іде другим."
        }
      ],
      "source": "17:18–19",
      "points": 2
    },
    {
      "id": "p10",
      "title": "Видали перший збіг",
      "instruction": "Прибери лише перше число 4 за його значенням. Друга четвірка має залишитися.",
      "code": "a = [2, 4, 6, 4]\n{{b0}}",
      "fields": [
        {
          "key": "b0",
          "label": "Пропуск 1",
          "expected": "a.remove(4)",
          "options": [
            "a.pop(4)",
            "a.clear()",
            "a.remove(4)",
            "a.remove(4"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Шукай за значенням, а не за позицією."
        }
      ],
      "source": "17:19–20",
      "points": 2
    },
    {
      "id": "p11",
      "title": "Вийми останнє число",
      "instruction": "Видали останній елемент і збережи його в x. Рішення має працювати для списків різної довжини.",
      "code": "a = [2, 4, 6]\nx = {{b0}}",
      "fields": [
        {
          "key": "b0",
          "label": "Пропуск 1",
          "expected": "a.pop()",
          "options": [
            "a.pop(",
            "a.pop()",
            "a.pop(0)",
            "a.pop(-1)",
            "a[-1]"
          ],
          "aliases": [
            "a.pop(-1)"
          ],
          "kind": "pyexpr",
          "hint": "Читання за індексом саме по собі не змінює список."
        }
      ],
      "source": "17:20",
      "points": 2
    },
    {
      "id": "p12",
      "title": "Очисть список",
      "instruction": "Прибери всі елементи з наявного списку однією командою, незалежно від його довжини.",
      "code": "a = [2, 4, 6]\n{{b0}}",
      "fields": [
        {
          "key": "b0",
          "label": "Пропуск 1",
          "expected": "a.clear()",
          "options": [
            "a.clear(",
            "a.clear()",
            "a.pop()",
            "a.remove(4)"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Після команди той самий список має стати порожнім."
        }
      ],
      "source": "17:18",
      "points": 2
    },
    {
      "id": "p13",
      "title": "Знайди перший індекс",
      "instruction": "Якщо t є у списку, виведи індекс першого входження. Інакше виведи повідомлення без помилки.",
      "code": "a = [2, 4, 6, 4]\nt = 4\nif {{b0}}:\n    print({{b1}})\nelse:\n    print(\"Значення немає\")",
      "fields": [
        {
          "key": "b0",
          "label": "Пропуск 1",
          "expected": "t in a",
          "options": [
            "t not in a",
            "t == a",
            "t in a",
            "t in"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Перевір наявність до пошуку індексу."
        },
        {
          "key": "b1",
          "label": "Пропуск 2",
          "expected": "a.index(t)",
          "options": [
            "a[t]",
            "a.index(t)",
            "a.count(t)",
            "a.index(t"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Потрібна позиція першого збігу, а не кількість збігів."
        }
      ],
      "source": "16:17–19; Задачі 2.py і 3.py; 17:21–22",
      "points": 2
    },
    {
      "id": "p14",
      "title": "Найвища оцінка та її повтори",
      "instruction": "Поверни два результати: найбільшу оцінку й кількість її входжень. Список оцінок непорожній.",
      "code": "def maxmarks(a):\n    m = max(a)\n    n = {{b0}}\n    return {{b1}}\n\nx, y = maxmarks([8, 11, 9, 11])",
      "fields": [
        {
          "key": "b0",
          "label": "Пропуск 1",
          "expected": "a.count(m)",
          "options": [
            "len(a)",
            "a.count(m)",
            "a.count(m",
            "a.index(m)"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Для [8, 11, 9, 11] входжень має бути два."
        },
        {
          "key": "b1",
          "label": "Пропуск 2",
          "expected": "m, n",
          "options": [
            "m + n",
            "n, m",
            "m n",
            "m, n"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Збережи порядок: спочатку оцінка, потім кількість."
        }
      ],
      "source": "17:20,23–25",
      "points": 2
    },
    {
      "id": "p15",
      "title": "Нижче від середньої",
      "instruction": "Для непорожнього списку визнач кількість оцінок, які строго нижчі від середньої. Рівні середній не враховуй.",
      "code": "def below_mean(a):\n    mid = {{b0}}\n    k = 0\n    for x in a:\n        if {{b1}}:\n            k += 1\n    return k",
      "fields": [
        {
          "key": "b0",
          "label": "Пропуск 1",
          "expected": "sum(a) / len(a)",
          "options": [
            "sum(a) len(a)",
            "sum(a) // len(a)",
            "sum(a) / len(a)",
            "sum(a) / max(a)"
          ],
          "aliases": [],
          "kind": "pyexpr",
          "hint": "Середнє може бути дробовим."
        },
        {
          "key": "b1",
          "label": "Пропуск 2",
          "expected": "x < mid",
          "options": [
            "x = mid",
            "mid > x",
            "x > mid",
            "x <= mid",
            "x < mid"
          ],
          "aliases": [
            "mid > x"
          ],
          "kind": "pyexpr",
          "hint": "Оцінка, рівна середній, не збільшує лічильник."
        }
      ],
      "source": "17:26–27",
      "points": 2
    }
  ],
  "tests": [
    [
      {
        "label": "Чому дорівнює сума [2, 4, 6]?",
        "expected": 12,
        "options": null,
        "kind": "number",
        "key": "q1",
        "hint": ""
      },
      {
        "label": "Для a = [-4, -1, -3] значення max(a) дорівнює…",
        "expected": -1,
        "options": null,
        "kind": "number",
        "key": "q2",
        "hint": ""
      },
      {
        "label": "Якою буде різниця між найбільшим і найменшим значеннями в [5, 5]?",
        "expected": 0,
        "options": null,
        "kind": "number",
        "key": "q3",
        "hint": ""
      },
      {
        "label": "Після a = [2, 4, 6] та x = a.pop() яке значення збережеться у x?",
        "expected": 6,
        "options": null,
        "kind": "number",
        "key": "q4",
        "hint": ""
      },
      {
        "label": "Скільки разів число 4 входить у [2, 4, 6, 4]?",
        "expected": 2,
        "options": null,
        "kind": "number",
        "key": "q5",
        "hint": ""
      },
      {
        "label": "Що станеться під час виклику [2, 4, 6].index(9)?",
        "expected": "Виникне помилка",
        "options": [
          "Повернеться 0",
          "Виникне помилка",
          "Повернеться -1"
        ],
        "kind": "select",
        "key": "q6",
        "hint": ""
      },
      {
        "label": "Яку пару поверне maxmarks([8, 11, 9, 11])?",
        "expected": "11, 2",
        "options": [
          "11, 1",
          "2, 11",
          "11, 2"
        ],
        "kind": "select",
        "key": "q7",
        "hint": ""
      },
      {
        "label": "Скільки оцінок строго нижчі за середню у [4, 6, 8]?",
        "expected": 1,
        "options": null,
        "kind": "number",
        "key": "q8",
        "hint": ""
      }
    ],
    [
      {
        "label": "Чому дорівнює сума [2, 6, 6]?",
        "expected": 14,
        "options": null,
        "kind": "number",
        "key": "q1",
        "hint": ""
      },
      {
        "label": "Для a = [-4, -1, -3] значення max(a) дорівнює…",
        "expected": -1,
        "options": null,
        "kind": "number",
        "key": "q2",
        "hint": ""
      },
      {
        "label": "Якою буде різниця між найбільшим і найменшим значеннями в [5, 5]?",
        "expected": 0,
        "options": null,
        "kind": "number",
        "key": "q3",
        "hint": ""
      },
      {
        "label": "Після a = [2, 4, 6] та x = a.pop() яке значення збережеться у x?",
        "expected": 6,
        "options": null,
        "kind": "number",
        "key": "q4",
        "hint": ""
      },
      {
        "label": "Скільки разів число 4 входить у [2, 4, 6, 4]?",
        "expected": 2,
        "options": null,
        "kind": "number",
        "key": "q5",
        "hint": ""
      },
      {
        "label": "Що станеться під час виклику [2, 4, 6].index(9)?",
        "expected": "Виникне помилка",
        "options": [
          "Повернеться 0",
          "Виникне помилка",
          "Повернеться -1"
        ],
        "kind": "select",
        "key": "q6",
        "hint": ""
      },
      {
        "label": "Яку пару поверне maxmarks([8, 11, 9, 11])?",
        "expected": "11, 2",
        "options": [
          "11, 1",
          "2, 11",
          "11, 2"
        ],
        "kind": "select",
        "key": "q7",
        "hint": ""
      },
      {
        "label": "Скільки оцінок строго нижчі за середню у [6, 8, 10]?",
        "expected": 1,
        "options": null,
        "kind": "number",
        "key": "q8",
        "hint": ""
      }
    ]
  ],
  "classes": [],
  "policy": {
    "first": 1,
    "second": 0.9,
    "later": 0.8
  }
};
