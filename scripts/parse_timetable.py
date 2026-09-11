# Script to parse and verify the two timetables from the user's images

morning_data = {
    # day: { period: { class: 'Subject - Teacher' } }
    0: { # Thứ 2
        1: {
            '6A9': 'HĐTN', '6A10': 'HĐTN', '6A11': 'HĐTN', '6A12': 'HĐTN',
            '7B9': 'HĐTN', '7B10': 'HĐTN', '7B11': 'HĐTN',
            '8C8': 'HĐTN', '8C9': 'HĐTN', '8C10': 'HĐTN',
            '9D8': 'HĐTN', '9D9': 'HĐTN', '9D10': 'HĐTN'
        },
        2: {
            '6A9': 'Sử - Thuận', '6A10': 'Toán - Ngoan', '6A11': 'Văn - Thắm', '6A12': 'KHTN - Tú',
            '7B9': 'Toán - Linh', '7B10': 'Văn - Phương', '7B11': 'T. Anh - Hương',
            '8C8': 'KHTN - Trung', '8C9': 'Toán - Huấn', '8C10': 'GDTC - Tiến',
            '9D8': 'Văn - Kiên', '9D9': 'MT - Lan', '9D10': 'KHTN - Long'
        },
        3: {
            '6A9': 'GDĐP - An', '6A10': 'Sử - Thuận', '6A11': 'Toán - Ngoan', '6A12': 'Văn - Thắm',
            '7B9': 'Văn - Phương', '7B10': 'Toán - Trung', '7B11': 'KHTN - Hoàng',
            '8C8': 'Toán - Huấn', '8C9': 'KHTN - Long', '8C10': 'CN - Thiết',
            '9D8': 'KHTN - Ngọc', '9D9': 'Địa - Kiên', '9D10': 'T. Anh - Hương'
        },
        4: {
            '6A9': 'Toán - Hoa', '6A10': 'KHTN - Tú', '6A11': 'GDĐP - An', '6A12': 'Văn - Thắm',
            '7B9': 'Văn - Phương', '7B10': 'GDTC - Tiến', '7B11': 'Sử - Thiện',
            '8C8': 'T. Anh - Hương', '8C9': 'KHTN - Trung', '8C10': 'Văn - Thuận',
            '9D8': 'CN - Thiết', '9D9': 'KHTN - Ngọc', '9D10': 'Toán - Hùng'
        }
    },
    1: { # Thứ 3
        1: {
            '6A9': 'Toán - Hoa', '6A10': 'Văn - Thắm', '6A11': 'T. Anh - Hương', '6A12': 'T. Anh - Hương',
            '7B9': 'Sử - Thuận', '7B10': 'Toán - Trung', '7B11': 'Văn - Phương',
            '8C8': 'GDTC - Tiến', '8C9': 'MT - Lan', '8C10': 'Sử - Thiện',
            '9D8': 'KHTN - Long', '9D9': 'Văn - Kiên', '9D10': 'Toán - Hùng'
        },
        2: {
            '6A9': 'T. Anh - Hương', '6A10': 'T. Anh - Hương', '6A11': 'Toán - Ngoan', '6A12': 'KHTN - Long',
            '7B9': 'Toán - Linh', '7B10': 'Văn - Phương', '7B11': 'GDTC - Tiến',
            '8C8': 'KHTN - Ngọc', '8C9': 'CN - Thiết', '8C10': 'Văn - Thuận',
            '9D8': 'Toán - Hùng', '9D9': 'GDĐP - An', '9D10': 'Văn - Thiện'
        },
        3: {
            '6A9': 'Văn - Thắm', '6A10': 'GDCD - Linh', '6A11': 'MT - Lan', '6A12': 'Tin - Hùng',
            '7B9': 'Nhạc - Hặc', '7B10': 'KHTN - Hoàng', '7B11': 'Địa - Kiên',
            '8C8': 'KHTN - Trung', '8C9': 'Địa - Phương', '8C10': 'Văn - Thuận',
            '9D8': 'Sử - Thiện', '9D9': 'T. Anh - Hương', '9D10': 'KHTN - Long'
        },
        4: {
            '6A9': 'GDCD - Linh', '6A10': 'Văn - Thắm', '6A11': 'KHTN - Long', '6A12': 'CN - Lan',
            '7B9': 'GDDP - An', '7B10': 'Văn - Phương', '7B11': 'Toán - Trung',
            '8C8': 'Văn - Thuận', '8C9': 'Toán - Huấn', '8C10': 'KHTN - Ngọc',
            '9D8': 'T. Anh - Hương', '9D9': 'Toán - Hùng', '9D10': 'Sử - Thiện'
        }
    },
    2: { # Thứ 4
        1: {
            '6A9': 'Văn - Thắm', '6A10': 'MT - Lan', '6A11': 'GDCD - Linh', '6A12': 'HĐTNHN - Hặc',
            '7B9': 'T. Anh - Hương', '7B10': 'T. Anh - Hương', '7B11': 'KHTN - Hoàng',
            '8C8': 'Sử - Thiện', '8C9': 'Văn - Thuận', '8C10': 'GDTC - Tiến',
            '9D8': 'KHTN - Trung', '9D9': 'GDCD - Thiết', '9D10': 'HĐTN - An'
        },
        2: {
            '6A9': 'KHTN - Long', '6A10': 'Toán - Ngoan', '6A11': 'KHTN - Tú', '6A12': 'Văn - Thắm',
            '7B9': 'Toán - Linh', '7B10': 'GDTC - Tiến', '7B11': 'Văn - Phương',
            '8C8': 'GDĐP - An', '8C9': 'Văn - Thuận', '8C10': 'Toán - Hoàng',
            '9D8': 'Văn - Kiên', '9D9': 'T. Anh - Hương', '9D10': 'MT - Lan'
        },
        3: {
            '6A9': 'MT - Lan', '6A10': 'GDTC - Tiến', '6A11': 'Toán - Ngoan', '6A12': 'KHTN - Long',
            '7B9': 'Văn - Phương', '7B10': 'KHTN - Hoàng', '7B11': 'Tin - Hoa',
            '8C8': 'Toán - Huấn', '8C9': 'Sử - Thiện', '8C10': 'KHTN - Trung',
            '9D8': 'Toán - Hùng', '9D9': 'Văn - Kiên', '9D10': 'T. Anh - Hương'
        },
        4: {
            '6A9': 'KHTN - Tú', '6A10': 'KHTN - Long', '6A11': 'Văn - Thắm', '6A12': 'Toán - Hoa',
            '7B9': 'Sử - Thuận', '7B10': 'Địa - Kiên', '7B11': 'Toán - Trung',
            '8C8': 'MT - Lan', '8C9': 'T. Anh - Hương', '8C10': 'Địa - Phương',
            '9D8': 'CN - Thiết', '9D9': 'Toán - Hùng', '9D10': 'GDTC - Tiến'
        }
    },
    3: { # Thứ 5
        1: {
            '6A9': 'T. Anh - Hương', '6A10': 'T. Anh - Hương', '6A11': 'Văn - Thắm', '6A12': 'KHTN - Long',
            '7B9': 'Địa - Kiên', '7B10': 'Văn - Phương', '7B11': 'Toán - Trung',
            '8C8': 'Văn - Thuận', '8C9': 'Sử - Thiện', '8C10': 'Toán - Hoàng',
            '9D8': 'GDTC - Tiến', '9D9': 'Tin - Huấn', '9D10': 'GDĐP - An'
        },
        2: {
            '6A9': 'Toán - Hoa', '6A10': 'Văn - Thắm', '6A11': 'KHTN - Long', '6A12': 'Địa - Phương',
            '7B9': 'Tin - Huấn', '7B10': 'Toán - Trung', '7B11': 'T. Anh - Hương',
            '8C8': 'Văn - Thuận', '8C9': 'GDTC - Tiến', '8C10': 'Sử - Thiện',
            '9D8': 'HĐTN - An', '9D9': 'Văn - Kiên', '9D10': 'Toán - Hùng'
        },
        3: {
            '6A9': 'Văn - Thắm', '6A10': 'Địa - Kiên', '6A11': 'KHTN - Long', '6A12': 'Toán - Hoa',
            '7B9': 'Văn - Phương', '7B10': 'KHTN - Hoàng', '7B11': 'Toán - Trung',
            '8C8': 'Toán - Huấn', '8C9': 'GDĐP - An', '8C10': 'T. Anh - Hương',
            '9D8': 'Toán - Hùng', '9D9': 'CN - Thiết', '9D10': 'Văn - Thiện'
        },
        4: {
            '6A9': 'Địa - Kiên', '6A10': 'Toán - Ngoan', '6A11': 'CN - Hặc', '6A12': 'Văn - Thắm',
            '7B9': 'KHTN - Hoàng', '7B10': 'GDCD - Hoa', '7B11': 'Văn - Phương',
            '8C8': 'KHTN - Long', '8C9': 'Tin - Huấn', '8C10': 'Văn - Thuận',
            '9D8': 'T. Anh - Hương', '9D9': 'HĐTN - An', '9D10': 'Văn - Thiện'
        }
    },
    4: { # Thứ 6
        1: {
            '6A9': 'Toán - Hoa', '6A10': 'Tin - Hùng', '6A11': 'T. Anh - Hương', '6A12': 'T. Anh - Hương',
            '7B9': 'GDTC - Tiến', '7B10': 'Sử - Thuận', '7B11': 'Văn - Phương',
            '8C8': 'Sử - Thiện', '8C9': 'KHTN - Ngọc', '8C10': 'Tin - Huấn',
            '9D8': 'KHTN - Long', '9D9': 'Văn - Kiên', '9D10': 'CN - Thiết'
        },
        2: {
            '6A9': 'KHTN - Long', '6A10': 'AN - Hặc', '6A11': 'Sử - Thuận', '6A12': 'Toán - Hoa',
            '7B9': 'T. Anh - Hương', '7B10': 'T. Anh - Hương', '7B11': 'GDTC - Tiến',
            '8C8': 'Địa - Phương', '8C9': 'Toán - Huấn', '8C10': 'Toán - Hoàng',
            '9D8': 'Toán - Hùng', '9D9': 'CN - Thiết', '9D10': 'Địa - Kiên'
        },
        3: {
            '6A9': 'GDTC - Tiến', '6A10': 'KHTN - Long', '6A11': 'Văn - Thắm', '6A12': 'Toán - Hoa',
            '7B9': 'Toán - Linh', '7B10': 'Nhạc - Hặc', '7B11': 'CN - Thiết',
            '8C8': 'Toán - Huấn', '8C9': 'Văn - Thuận', '8C10': 'HĐTN - Ngoan',
            '9D8': 'Văn - Kiên', '9D9': 'Toán - Hùng', '9D10': 'T. Anh - Hương'
        },
        4: {
            '6A9': 'Văn - Thắm', '6A10': 'Toán - Ngoan', '6A11': 'Địa - Phương', '6A12': 'AN - Hặc',
            '7B9': 'KHTN - Hoàng', '7B10': 'Tin - Hoa', '7B11': 'HĐTN - Lan',
            '8C8': 'GDCD - Huấn', '8C9': 'Văn - Thuận', '8C10': 'KHTN - Long',
            '9D8': 'Địa - Kiên', '9D9': 'T. Anh - Hương', '9D10': 'KHTN - Ngọc'
        }
    }
}

# Afternoon data (days: Thứ 2 = 0 (empty), Thứ 3 = 1, Thứ 4 = 2, Thứ 5 = 3, Thứ 6 = 4)
afternoon_data = {
    1: { # Thứ 3 chiều
        1: {
            '6A9': 'T. Anh - Hương', '6A10': 'T. Anh - Hương', '6A11': 'Nhạc - Hặc', '6A12': 'Địa - Phương',
            '7B9': 'HĐTN - Ngọc', '7B10': 'CN - Thiết', '7B11': 'KHTN - Hoàng',
            '8C8': 'Tin - Huấn', '8C9': 'GDCD - Linh', '8C10': 'GDĐP - An',
            '9D8': 'Địa - Kiên', '9D9': 'Toán - Hùng', '9D10': 'Văn - Thiện'
        },
        2: {
            '6A9': 'KHTN - Long', '6A10': 'Địa - Kiên', '6A11': 'GDTC - Tiến', '6A12': 'GDTC - Tiến',
            '7B9': 'KHTN - Hoàng', '7B10': 'Sử - Thuận', '7B11': 'HĐTN - Lan',
            '8C8': 'CN - Thiết', '8C9': 'T. Anh - Hương', '8C10': 'HĐTN - Ngoan',
            '9D8': 'GDDP - An', '9D9': 'Nhạc - Hặc', '9D10': 'KHTN - Trung'
        },
        3: {
            '6A9': 'GDTC - Tiến', '6A10': 'GDTC - Tiến', '6A11': 'HĐTN - Ngoan', '6A12': 'MT - Lan',
            '7B9': 'HĐTN - Ngọc', '7B10': 'Toán - Trung', '7B11': 'GDCD - Hoa',
            '8C8': 'T. Anh - Hương', '8C9': 'HĐTN - Linh', '8C10': 'GDCD - Hoàng',
            '9D8': 'Nhạc - Hặc', '9D9': 'Sử - Thiện', '9D10': 'HĐTN - An'
        }
    },
    2: { # Thứ 4 chiều
        1: {
            '6A9': 'Nhạc - Hặc', '6A10': 'Văn - Thắm', '6A11': 'T. Anh - Hương', '6A12': 'T. Anh - Hương',
            '7B9': 'GDCD - Hoa', '7B10': 'GDDP - An', '7B11': 'KHTN - Hoàng',
            '8C8': 'Văn - Thuận', '8C9': 'HĐTN - Linh', '8C10': 'CN - Thiết',
            '9D8': 'Tin - Huấn', '9D9': 'KHTN - Long', '9D10': 'Địa - Kiên'
        },
        2: {
            '6A9': 'Tin - Hoa', '6A10': 'GDĐP - An', '6A11': 'Địa - Phương', '6A12': 'HĐTN - Hặc',
            '7B9': 'GDTC - Tiến', '7B10': 'KHTN - Hoàng', '7B11': 'MT - Lan',
            '8C8': 'HĐTN - Hưng', '8C9': 'KHTN - Trung', '8C10': 'T. Anh - Hương',
            '9D8': 'GDCD - Hùng', '9D9': 'Địa - Kiên', '9D10': 'Tin - Huấn'
        },
        3: {
            # Only classes with 3 periods:
            '8C10': 'T. Anh - Hương',
            '9D8': 'HĐTN - An',
            '9D9': 'GDTC - Tiến',
            '9D10': 'CN - Thiết'
        }
    },
    3: { # Thứ 5 chiều
        1: {
            '6A9': 'Địa - Kiên', '6A10': 'KHTN - Long', '6A11': 'Toán - Ngoan', '6A12': 'Sử - Thuận',
            '7B9': 'T. Anh - Hương', '7B10': 'T. Anh - Hương', '7B11': 'GDDP - An',
            '8C8': 'HĐTN - Hưng', '8C9': 'CN - Thiết', '8C10': 'Toán - Hoàng',
            '9D8': 'MT - Lan', '9D9': 'KHTN - Trung', '9D10': 'AN - Hặc'
        },
        2: {
            '6A9': 'HĐTN - Hoàn', '6A10': 'HĐTN - Ngoan', '6A11': 'GDTC - Tiến', '6A12': 'GDĐP - An',
            '7B9': 'CN - Thiết', '7B10': 'MT - Lan', '7B11': 'Sử - Thiện',
            '8C8': 'T. Anh - Hương', '8C9': 'Nhạc - Hặc', '8C10': 'KHTN - Trung',
            '9D8': 'Văn - Kiên', '9D9': 'KHTN - Long', '9D10': 'Toán - Hùng'
        },
        3: {
            # Classes with 3 periods on Thu 5 chieu:
            '7B11': 'Nhạc - Hặc',
            '8C8': 'GDTC - Tiến',
            '8C9': 'GDTC - Tiến',
            '9D8': 'T. Anh - Hương',
            '9D9': 'HĐTN - An',
            '9D10': 'GDCD - Thiện'
        }
    },
    4: { # Thứ 6 chiều
        1: {
            '6A9': 'CN - Tú', '6A10': 'HĐTN - Ngoan', '6A11': 'Tin - Hùng', '6A12': 'GDCD - Linh',
            '7B9': 'KHTN - Hoàn', '7B10': 'HĐTN - Long', '7B11': 'T. Anh - Hương',
            '8C8': 'Nhạc - Hặc', '8C9': 'Toán - Huấn', '8C10': 'MT - Lan',
            '9D8': 'GDTC - Tiến', '9D9': 'GDTC - Tiến', '9D10': 'GDTC - Tiến'
        },
        2: {
            '6A9': 'HĐTN - Hoàn', '6A10': 'CN - Tú', '6A11': 'HĐTN - Ngoan', '6A12': 'GDTC - Tiến',
            '7B9': 'MT - Lan', '7B10': 'HĐTN - Long',
            '8C8': 'CN - Thiết', '8C9': 'T. Anh - Hương', '8C10': 'Nhạc - Hặc'
        }
        # Note: 7B11, 9D8, 9D9, 9D10 have NO period 2 on Thứ 6 chiều!
    }
}

def parse_sub_teacher(val):
    if not val: return '', ''
    val = val.strip()
    if '-' in val:
        parts = val.split('-')
        return parts[0].strip(), parts[1].strip()
    return val, ''

classes = ['6A9', '6A10', '6A11', '6A12', '7B9', '7B10', '7B11', '8C8', '8C9', '8C10', '9D8', '9D9', '9D10']
print("Classes count:", len(classes))

