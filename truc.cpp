#include <stdio.h>

void recurse ( int count ) // Each call gets its own count
{
printf("%d\n",count );
  // It is not necessary to increment count since each function's
  //  variables are separate (so each count will be initialized one greater)
  recurse ( count + 1 );
}

int main()
{
	recurse(0);
}