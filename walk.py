import os
import shutil
import errno

src_folder = 'C:\\'  # change to your source folder, if needed
dst_folder = 'C:\\path\\to\\destination'  # change to your destination folder

# List of directories to skip
skip_dirs = ['Windows', 'System32', 'Program Files', 'Program Files (x86)']

for dirpath, dirs, files in os.walk(src_folder):
    # Skip the directories in skip_dirs
    dirs[:] = [d for d in dirs if d not in skip_dirs]

    # try-except block to handle permission errors
    try:
        for file in files:
            if file.endswith('.ipynb'):
                src_file = os.path.join(dirpath, file)
                dst_file = os.path.join(dst_folder, file)

                if os.path.exists(dst_file):
                    base, extension = os.path.splitext(file)
                    i = 1
                    while os.path.exists(os.path.join(dst_folder, f'{base}_{i}{extension}')):
                        i += 1
                    dst_file = os.path.join(dst_folder, f'{base}_{i}{extension}')

                shutil.copy(src_file, dst_file)

    except PermissionError as exc:
        if exc.errno != errno.EACCES:
            raise
        print(f'Skipped directory {dirpath} due to permission error')
